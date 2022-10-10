const {
  generateUsername,
  generatePassword,
  generateEmail,
  getNewAnneeUniversitaire,
} = require("../utils/user");
const readExcelFile = require("xlsx");
const Role = require("../models/role");
const User = require("../models/user");
const Etudiant = require("../models/etudiant");
const Filiere = require("../models/filiere");
const AnneeUniversitaire = require("../models/anneeUniversitaire");
const fs = require("fs");
const { filiere } = require("../models");
const { default: mongoose } = require("mongoose");

const basedir = process.cwd();

const deleteExcel = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err;
    }
  });
};

const excelEtudiantChecks = (row) => {
  const rowNames = [
    "cne",
    "code_apogee",
    "nom",
    "prenom",
    "cin",
    "date_naissance",
    "telephone",
    "adresse",
    "ville",
    "pays",
    "date_inscription",
    "filiere",
  ];
  let rowErrors = [];
  rowNames.forEach((rowName) => {
    if (!Object.keys(row).includes(rowName)) {
      rowErrors.push(rowName);
    }
  });
  if (rowErrors.length == 0) {
    return null;
  } else if (rowErrors.length == 1) {
    return "The field " + rowErrors[0] + " is missing";
  } else {
    return "The fields " + rowErrors.join(", ") + " are missing";
  }
};

const excelEtudiantRowCheck = (row) => {
  const rowNames = [
    "cne",
    "code_apogee",
    "nom",
    "prenom",
    "cin",
    "date_naissance",
    "telephone",
    "adresse",
    "ville",
    "pays",
    "date_inscription",
    "filiere",
  ];
  let rowErrors = [];
  rowNames.forEach((rowName) => {
    if (
      row[rowName] == null ||
      row[rowName] == "" ||
      row[rowName] == undefined
    ) {
      rowErrors.push(rowName);
    }
  });
  if (rowErrors.length == 0) {
    return true;
  } else {
    return false;
  }
};

const uploadExcelEtudiant = async (req, res) => {
  let path = basedir + "/resources/uploads/" + req.file.filename;

  let studentCount = 0;

  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: "Excel file expected",
      });
    }

    const file = readExcelFile.readFile(path);
    const sheets = file.SheetNames;

    let filiereAbbr = req.body.filiere;

    let filiere = await Filiere.findOne({ abbr: filiereAbbr });

    let filiereID = null;

    let totalRows = 0;

    let anneeUniversitaire;

    if (filiere) {
      filiereID = filiere._id;
    }

    for (let i = 0; i < sheets.length; i++) {
      const temp = readExcelFile.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]]
      );

      const role = await Role.findOne({ name: "etudiant" });

      totalRows = temp.length;

      if (excelEtudiantChecks(temp[0]) == null) {
        await Promise.all(
          temp.map(async (row) => {
            if (excelEtudiantRowCheck(row)) {
              try {
                if (
                  filiereAbbr == null ||
                  (filiereID != null &&
                    filiereID != undefined &&
                    filiereAbbr == row.filiere.toUpperCase())
                ) {
                  let existantUser = await User.findOne({ cin: row.cin });
                  if (existantUser == null && existantUser == undefined) {
                    let user = new User({
                      nom: row.nom,
                      prenom: row.prenom,
                      cin: row.cin,
                      email: generateEmail(row.nom, row.prenom, "etudiant"),
                      username: generateUsername(row.nom, row.prenom),
                      password: generatePassword(16).hash,
                    });

                    user.roles = [role._id];

                    user = await user.save();

                    let etudiant = new Etudiant({
                      cne: row.cne,
                      code_apogee: row.code_apogee,
                      date_naissance: row.date_naissance,
                      telephone: row.telephone,
                      address: row.adresse,
                      ville: row.ville,
                      pays: row.pays,
                      date_inscription: row.date_inscription,
                      user: user._id,
                    });

                    // TODO change ...
                    etudiant.date_sort = "12/10/2031";

                    filiereAbbr = row.filiere.toUpperCase();

                    // if (filiereID != null) {
                    //   etudiant.filiere = filiereID;
                    // } else {
                    //   filiere = await Filiere.findOne({ abbr: filiereAbbr });
                    //   etudiant.filiere = filiere._id;
                    // }

                    if (filiereID == null) {
                      filiere = await Filiere.findOne({ abbr: filiereAbbr });
                      filiereID = filiere._id;
                    }

                    if(row.annee_universitaire){
                      anneeUniversitaire = new AnneeUniversitaire({
                        annee: row.annee_universitaire,
                        etudiant: etudiant._id,
                        filiere: filiereID
                      });
                    } else {
                      anneeUniversitaire = new AnneeUniversitaire({
                        annee: getNewAnneeUniversitaire(),
                        etudiant: etudiant._id,
                        filiere: filiereID
                      });
                    }

                    anneeUniversitaire = await anneeUniversitaire.save();

                    etudiant.annee_universitaires.push(anneeUniversitaire._id);

                    etudiant = await etudiant.save();

                    filiere.etudiants.push(etudiant._id);

                    // TODO .. uncomment ...
                    // user._id && etudiant._id && sendNewUserEmail(user, password.plain);
                    studentCount += 1;
                  }
                }
              } catch (error) {
                console.log(error);
              }
            }
            //   else {
            //     console.log("row error");
            //   }
          })
        ).then(() => {
          deleteExcel(path);
          let message = "";
          if (studentCount == 1) {
            message =
              "Excel file uploaded successfully: " +
              studentCount +
              " student added" +
              " ( total : " + totalRows + " )";
          } else if (studentCount > 1) {
            message =
              "Excel file uploaded successfully: " +
              studentCount +
              " students added" +
              " ( total : " + totalRows + " )";
          } else {
            message = "Excel file uploaded successfully : " + "No Student added" + " ( total : " + totalRows + " )";
          }
          res.status(200).send({
            message: message,
          });
          return;
        });
      } else {
        deleteExcel(path);
        res.status(500).send({
          message: excelEtudiantChecks(temp[0]),
        });
        return;
      }
    }
  } catch (error) {
    deleteExcel(path);
    console.log(error);
    res.status(500).send({
      message: "Could not import students from : " + req.file.originalname,
    });
    return;
  }
};


















const excelNoteChecks = (row) => {
  const rowNames = [
    "code_apogee",
    "annee_universitaire",
    "filiere",
  ];
  let rowErrors = [];
  rowNames.forEach((rowName) => {
    if (!Object.keys(row).includes(rowName)) {
      rowErrors.push(rowName);
    }
  });
  if (rowErrors.length == 0) {
    return null;
  } else if (rowErrors.length == 1) {
    return "The field " + rowErrors[0] + " is missing";
  } else {
    return "The fields " + rowErrors.join(", ") + " are missing";
  }
};




const uploadExcelNotes = async (req, res) => {
  let path = basedir + "/resources/uploads/" + req.file.filename;
  
  let studentCount = 0;

  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: "Excel file expected",
      });
    }

    const file = readExcelFile.readFile(path);
    const sheets = file.SheetNames;

    let filiereAbbr = req.body.filiere;

    let filiere = await Filiere.findOne({ abbr: filiereAbbr });

    let filiereID = null;

    let totalRows = 0;

    let anneeUniversitaire;

    if (filiere) {
      filiereID = filiere._id;
    }









    for (let i = 0; i < sheets.length; i++) {
      const temp = readExcelFile.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]]
      );

      totalRows = temp.length;

      if (excelEtudiantChecks(temp[0]) == null) {
        await Promise.all(
          temp.map(async (row) => {
            if (excelNoteChecks(row)) {
              try {
                if (
                  filiereAbbr == null ||
                  (filiereID != null &&
                    filiereID != undefined &&
                    filiereAbbr == row.filiere.toUpperCase())
                ) {

                  let existantEtudiant = await Etudiant.findOne({
                    code_apogee: row.code_apogee,
                  });

                  if (existantEtudiant != null && existantEtudiant != undefined && existantEtudiant._id != null && existantEtudiant._id != undefined) {

                    let existantAnneeUniversitaire = await AnneeUniversitaire.findOne({
                      annee: row.annee_universitaire,
                      etudiant: existantEtudiant._id
                    });

                  //   if (existantAnneeUniversitaire != null && existantAnneeUniversitaire != undefined && existantAnneeUniversitaire._id != null && existantAnneeUniversitaire._id != undefined) {
                  //     let existantNote = await Note.findOne({
                  //       annee_universitaire: existantAnneeUniversitaire._id,
                  //       filiere: filiereID
                  //     });

                  //     if (existantNote != null && existantNote != undefined && existantNote._id != null && existantNote._id != undefined) {
                  //       existantNote.note = row.note;
                  //       existantNote.save();
                  //     } else {
                  //       let note = new Note({
                  //         annee_universitaire: existantAnneeUniversitaire._id,
                  //         filiere: filiereID,
                  //         note: row.note
                  //       });
                  //       note.save();
                  //     }
                  //   } else {
                  //     anneeUniversitaire = new AnneeUniversitaire({
                  //       annee: row.annee_universitaire,
                  //       etudiant: existantEtudiant._id,
                  //       filiere: filiereID
                  //     });
                  //     anneeUniversitaire = await anneeUniversitaire.save();
                  //     let note = new Note({
                  //       annee_universitaire: anneeUniversitaire._id,
                  //       filiere: filiereID,
                  //       note: row.note
                  //     });
                  //     note.save();
                  //   }
                  // }


                  
                    if(row.annee_universitaire){
                      anneeUniversitaire = new AnneeUniversitaire({
                        annee: row.annee_universitaire,
                        etudiant: etudiant._id,
                        filiere: filiereID
                      });
                    } else {
                      anneeUniversitaire = new AnneeUniversitaire({
                        annee: getNewAnneeUniversitaire(),
                        etudiant: etudiant._id,
                        filiere: filiereID
                      });
                    }

                    // TODO change ...
                    etudiant.date_sort = "12/10/2031";

                    filiereAbbr = row.filiere.toUpperCase();

                    // if (filiereID != null) {
                    //   etudiant.filiere = filiereID;
                    // } else {
                    //   filiere = await Filiere.findOne({ abbr: filiereAbbr });
                    //   etudiant.filiere = filiere._id;
                    // }

                    if (filiereID == null) {
                      filiere = await Filiere.findOne({ abbr: filiereAbbr });
                      filiereID = filiere._id;
                    }

                    

                    anneeUniversitaire = await anneeUniversitaire.save();

                    etudiant.annee_universitaires.push(anneeUniversitaire._id);

                    etudiant = await etudiant.save();

                    filiere.etudiants.push(etudiant._id);

                    // TODO .. uncomment ...
                    // user._id && etudiant._id && sendNewUserEmail(user, password.plain);
                    studentCount += 1;
                  }
                }
              } catch (error) {
                console.log(error);
              }
            }
            //   else {
            //     console.log("row error");
            //   }
          })
        ).then(() => {
          deleteExcel(path);
          let message = "";
          if (studentCount == 1) {
            message =
              "Excel file uploaded successfully: " +
              studentCount +
              " student added" +
              " ( total : " + totalRows + " )";
          } else if (studentCount > 1) {
            message =
              "Excel file uploaded successfully: " +
              studentCount +
              " students added" +
              " ( total : " + totalRows + " )";
          } else {
            message = "Excel file uploaded successfully : " + "No Student added" + " ( total : " + totalRows + " )";
          }
          res.status(200).send({
            message: message,
          });
          return;
        });
      } else {
        deleteExcel(path);
        res.status(500).send({
          message: excelEtudiantChecks(temp[0]),
        });
        return;
      }
    }











  } catch (error) {
    deleteExcel(path);
    console.log(error);
    res.status(500).send({
      message: "Could not import students from : " + req.file.originalname,
    });
    return;
  }
};

module.exports = {
  uploadExcelEtudiant,
};
