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

const uploadExcel = async (req, res) => {
  let path = basedir + "/resources/uploads/" + req.file.filename;

  let studentCount = 0;

  try {
    if (req.file == undefined) {
      return res.status(400).send("Excel file expected");
    }

    const file = readExcelFile.readFile(path);
    const sheets = file.SheetNames;

    let filiereAbbr = req.body.filiere;

    let filiere = await Filiere.findOne({ abbr: filiereAbbr });

    let filiereID = null;

    let totalRows = 0;

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
                      password: generatePassword(16),
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

                    if (filiereID != null) {
                      etudiant.filiere = filiereID;
                    } else {
                      filiere = await Filiere.findOne({ abbr: filiereAbbr });
                      etudiant.filiere = filiere._id;
                    }

                    let anneeUniversitaire = new AnneeUniversitaire({
                      annee: getNewAnneeUniversitaire(),
                      etudiant: etudiant._id,
                    });

                    anneeUniversitaire = await anneeUniversitaire.save();

                    etudiant.annee_universitaires.push(anneeUniversitaire._id);

                    etudiant = await etudiant.save();

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
  uploadExcel,
};
