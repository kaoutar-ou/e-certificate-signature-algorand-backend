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
const Note = require("../models/note");
const Module = require("../models/module");
const Semestre = require("../models/semestre");

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
    "admis"
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

const excelNoteRowCheck = (row) => {
  const rowNames = [
    "code_apogee",
    "annee_universitaire",
    "filiere",
    "admis"
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

const getNoteRow = async (row, filiereID) => {
  // console.log(row);
  let excludedRowNames = [ "code_apogee", "annee_universitaire", "filiere", "admis" ];
  
  let noteRow = {};
  let rowNames = Object.keys(row);

  
  await Promise.all(
    rowNames.map( async (rowName) => {
      let module = null;
      let semestre = null;
      let filiere = null;
      if (!excludedRowNames.includes(rowName)) {
        module = null;
        // console.log(rowName);
        module = await Module.findOne({
          nom: rowName,
        });
        // console.log(module);
        if (module != null && module != undefined) {

          filiere = await Filiere.findOne({ _id: filiereID });
          // console.log(filiere.abbr);
          semestre = await Semestre.findOne({
            _id: module.semestre,
            filiere: filiereID,
          });

          // console.log(semestre);
          // console.log(filiereID);

          if (semestre) {
            // console.log("semestre found------------------------------------------");
            // if (semestre.filiere == filiereID) {
            //   console.log("module found------------------------------------------");
              noteRow[module._id] = row[rowName];
            // } 
          }
          // noteRow[module._id] = row[rowName];
        }
        // noteRow[rowName] = { row[rowName]};
      }
    })
  )
  // console.log("---------------------");
  // console.log(noteRow);


  return noteRow;
}




const uploadExcelNotes = async (req, res) => {
  let path = basedir + "/resources/uploads/" + req.file.filename;
  
  let noteCount = 0;
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
    let noteRow


    if (filiere) {
      filiereID = filiere._id;
    }


    for (let i = 0; i < sheets.length; i++) {
      const temp = readExcelFile.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]]
      );

      totalRows = temp.length;

      if (excelNoteChecks(temp[0]) == null) {
        await Promise.all(
          temp.map(async (row) => {
            if (excelNoteRowCheck(row)) {
              try {
                if (
                  filiereAbbr == null ||
                  (filiereID != null &&
                    filiereID != undefined &&
                    filiereAbbr == row.filiere.toUpperCase())
                ) {
                  let etudiant

                  etudiant = await Etudiant.findOne({
                    code_apogee: row.code_apogee,
                  });

                  // console.log(etudiant.code_apogee)

                  let filiereAbbr_ = row.filiere.toUpperCase();
                  if (filiereID == null) {
                    filiere = await Filiere.findOne({ abbr: filiereAbbr_ });
                    filiereID = filiere._id;
                  }

                  // console.log(filiere.abbr)

                  if (etudiant != null && etudiant != undefined && etudiant._id != null && etudiant._id != undefined) {

                    let anneeUniversitaire = await AnneeUniversitaire.findOne({
                      annee: row.annee_universitaire,
                      etudiant: etudiant._id
                    });

                    // console.log(anneeUniversitaire.annee)

                    // XXX annee added to all created students ?
                    if (anneeUniversitaire == null || anneeUniversitaire == undefined || anneeUniversitaire._id == null || anneeUniversitaire._id == undefined) {
                      anneeUniversitaire = new AnneeUniversitaire({
                        annee: row.annee_universitaire,
                        etudiant: etudiant._id,
                        filiere: filiereID
                      });
                      anneeUniversitaire = await anneeUniversitaire.save();
                      etudiant.annee_universitaires.push(anneeUniversitaire._id);
                      etudiant = await etudiant.save();
                    }

                    noteRow = await getNoteRow(row, filiereID);

                    // console.log(noteRow)
                    if (Object.keys(noteRow).length > 0) {
                      
                        // console.log(noteRow)
                        // console.log("1")

                        await Promise.all(
                          Object.keys(noteRow).map(async (noteRowKey) => {
                            let module
                            let note

                            // console.log(noteRowKey)
                            // console.log("2")

                            module = await Module.findOne({
                              _id: noteRowKey,
                            });
                            
                            if (module != null && module != undefined && module._id != null && module._id != undefined) {
                              
                              // console.log("---" + module.nom + "---")
                              let moduleID = module._id;
                              // console.log(moduleID)

                            // console.log("3")

                              note = await Note.findOne({
                                module: moduleID,
                                etudiant: etudiant._id,
                                annee_universitaire: anneeUniversitaire._id,
                              });

                              if (note == null || note == undefined || note._id == null || note._id == undefined) {
                                // console.log("--------"+moduleID)
                                note = new Note({
                                  module: moduleID,
                                  etudiant: etudiant._id,
                                  note: noteRow[noteRowKey],
                                  annee_universitaire: anneeUniversitaire._id,
                                });
                                note = await note.save();
                                anneeUniversitaire.notes.push(note._id);

                                noteCount++;
                              }
                            }

                            // console.log(noteCount)
                            module = null;
                            note = null;

                          })
                        )                      
                        studentCount++;
                      }
                      
                      if (row.admis && row.admis.toLowerCase() == "oui") {
                        anneeUniversitaire.isAdmis = true;
                      }

                      anneeUniversitaire = await anneeUniversitaire.save();
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
          ).then(async () => {
            deleteExcel(path);
          let message = "";
          if (noteCount == 1) {
            message =
              "Excel file uploaded successfully: " +
              noteCount +
              " note added for " + 
              studentCount + " student";
          } else if (noteCount > 1) {
            message =
              "Excel file uploaded successfully: " +
              noteCount +
              " notes added for " + 
              studentCount + (studentCount > 1 ? " students" : " student");
          } else {
            message = "Excel file uploaded successfully : " + "No Note added";
          }
          res.status(200).send({
            message: message,
          });
          return;
        });
      } else {
        deleteExcel(path);
        res.status(500).send({
          message: excelNoteChecks(temp[0]),
        });
        return;
      }
    }
  } catch (error) {
    deleteExcel(path);
    console.log(error);
    res.status(500).send({
      message: "Could not import notes from : " + req.file.originalname,
    });
    return;
  }
};

module.exports = {
  uploadExcelEtudiant,
  uploadExcelNotes,
};
