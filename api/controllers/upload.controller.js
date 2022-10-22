const {
  generateUsername,
  generatePassword,
  generateEmail,
  getNewAnneeUniversitaire,
} = require("../utils/user");

const Sequelize = require("sequelize");
const sequelize = require("../../config/db");

const readExcelFile = require("xlsx");
const fs = require("fs");
const path = require("path");
const Filiere = require("../models/Filiere");
const Role = require("../models/Role");
const {
  excelEtudiantMissingRowNamesCheck,
  excelEtudiantMissingRowValuesCheck,
  deleteFile,
  excelNoteMissingRowNamesCheck,
  excelNoteMissingRowValuesCheck,
  getNoteRow,
} = require("../utils/upload");
const User = require("../models/User");
const AnneeUniversitaire = require("../models/AnneeUniversitaire");
const Etudiant = require("../models/Etudiant");

const basedir = process.cwd();
const dir = path.join(basedir, "uploads", "excel");

const uploadExcelEtudiant = async (req, res) => {
  if (
    req.file == undefined ||
    req.file == null ||
    req.file?.filename == undefined ||
    req.file?.filename == null
  ) {
    return res.status(400).send({ message: "Please upload an Excel file!" });
  }

  console.log(req.file.filename);
  let filePath = path.join(dir, req.file.filename);

  let studentCount = 0;

  const file = readExcelFile.readFile(filePath);
  // const sheet = file.Sheets[file.SheetNames[0]];
  // const data = readExcelFile.utils.sheet_to_json(sheet);
  const sheetNames = file.SheetNames;

  let filiereAbbr = req?.body?.filiere ? req.body.filiere : null;
  let filiere = await Filiere.findOne({
    where: sequelize.where(
      sequelize.fn("lower", sequelize.col("abbr")),
      sequelize.fn("lower", filiereAbbr)
    ),
  });
  let filiereID = filiere?.dataValues?.id ? filiere.dataValues.id : null;

  console.log(filiereID);

  const role = await Role.findOne({ where: { name: "etudiant" } });
  const roleID = role?.dataValues?.id ? role.dataValues.id : null;
  console.log(roleID);

  if (roleID == null) {
    return res.status(400).send({ message: "Internal server error" });
  }

  let totalRows = 0;

  for (let i = 0; i < sheetNames.length; i++) {
    const sheet = file.Sheets[sheetNames[i]];
    const data = readExcelFile.utils.sheet_to_json(sheet);
    // console.log(data);
    totalRows += data.length;

    const missingRowsCheck = excelEtudiantMissingRowNamesCheck(data[0]);
    if (missingRowsCheck != null) {
        console.log("missingRowsCheck");
      return res.status(400).send({ message: missingRowsCheck });
    }

    await Promise.all(
      data.map(async (row) => {
        console.log("row");
        if (excelEtudiantMissingRowValuesCheck(row)) {
          if (filiereID == null || filiereAbbr == row.filiere.toUpperCase()) {
            filiereAbbr = row.filiere.toUpperCase();
            if (filiereID == null) {
              filiere = await Filiere.findOne({
                where: sequelize.where(
                  sequelize.fn("lower", sequelize.col("abbr")),
                  sequelize.fn("lower", filiereAbbr)
                ),
              });
              filiereID = filiere?.dataValues?.id
                ? filiere.dataValues.id
                : null;
            }

            if ((filiereID = !null)) {
              let existantUser = null;
              existantUser = await User.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        { cin: row.cin, },
                        { username: generateUsername(row.nom, row.prenom) },
                    ],
                },
              });

              console.log(existantUser == null);

              if (existantUser == null || existantUser == undefined) {

                try {
                let password = generatePassword(16);
                let user = await User.create({
                  nom: row.nom,
                  prenom: row.prenom,
                  cin: row.cin,
                  email: generateEmail(row.nom, row.prenom, ["etudiant"]),
                  username: generateUsername(row.nom, row.prenom),
                  password: password.hash,
                });
                user.setRoles([roleID]);

                let etudiant = await Etudiant.create({
                  cne: row.cne,
                  code_apogee: row.code_apogee,
                  date_naissance: row.date_naissance,
                  telephone: row.telephone,
                  address: row.adresse,
                  ville: row.ville,
                  pays: row.pays,
                  date_inscription: row.date_inscription,
                  date_sortie: null,
                });

                etudiant.setUser(user.id);

                let anneeUniversitaire = null;

                if (row.annee_universitaire) {
                  anneeUniversitaire = await AnneeUniversitaire.create({
                    annee: row.annee_universitaire,
                    // EtudiantId: etudiant.id,
                    // FiliereId: filiereID
                  });
                  console.log(anneeUniversitaire.id);

                etudiant.addAnneeUniversitaire(anneeUniversitaire.id);

                } else {
                  anneeUniversitaire = await AnneeUniversitaire.create({
                    annee: getNewAnneeUniversitaire(),
                    // EtudiantId: etudiant.id,
                    // FiliereId: filiereID
                  });
                  console.log(anneeUniversitaire.id);
                etudiant.addAnneeUniversitaire(anneeUniversitaire.id);

                }
                anneeUniversitaire.setEtudiant(etudiant.id);
                anneeUniversitaire.setFiliere(filiereID);

                // etudiant.addAnneeUniversitaire(anneeUniversitaire.id);

                // user.addFiliere([filiereID]);

                
                    // TODO .. uncomment ...
                    // user._id && etudiant._id && sendNewUserEmail(user, password.plain);
                studentCount++;
                } catch (error) {
                    console.log(error);
                    // console.log("error");
                }
              }
            }
          }
        }
      })
    )
      .then(() => {
        console.log("Done");
        deleteFile(filePath);
        let message = "";
        if (studentCount == 1) {
          message =
            "Excel file uploaded successfully: " +
            studentCount +
            " student added" +
            " ( total : " +
            totalRows +
            " )";
        } else if (studentCount > 1) {
          message =
            "Excel file uploaded successfully: " +
            studentCount +
            " students added" +
            " ( total : " +
            totalRows +
            " )";
        } else {
          message =
            "Excel file uploaded successfully : " +
            "No Student added" +
            " ( total : " +
            totalRows +
            " )";
        }
        res.status(200).send({
          message: message,
        });
        return;
      })
      .catch((err) => {
        deleteFile(filePath);
        console.log(err);
        return res.status(500).send({ message: "Internal server error" });
      });
  }
};




const uploadExcelNotes = async (req, res) => {
  let filePath = path.join(dir, req?.file?.filename);
  let noteCount = 0;
  let studentCount = 0;

  try {
    if (
        req.file == undefined ||
        req.file == null ||
        req.file?.filename == undefined ||
        req.file?.filename == null
      ) {
        return res.status(400).send({ message: "Please upload an Excel file!" });
      }

  const file = readExcelFile.readFile(filePath);

      const sheetNames = file.SheetNames;

      let filiereAbbr = req?.body?.filiere ? req.body.filiere : null;
  let filiere = await Filiere.findOne({
    where: sequelize.where(
      sequelize.fn("lower", sequelize.col("abbr")),
      sequelize.fn("lower", filiereAbbr)
    ),
  });
  let filiereID = filiere?.dataValues?.id ? filiere.dataValues.id : null;

  console.log(filiereID);
  let totalRows = 0;
  let noteRow

  for (let i = 0; i < sheetNames.length; i++) {
    const sheet = file.Sheets[sheetNames[i]];
    const data = readExcelFile.utils.sheet_to_json(sheet);
    // console.log(data);
    totalRows += data.length;

    const missingRowsCheck = excelNoteMissingRowNamesCheck(data[0]);
    if (missingRowsCheck != null) {
        console.log("missingRowsCheck");
      return res.status(400).send({ message: missingRowsCheck });
    }

    await Promise.all(
        data.map(async (row) => {
            if(excelNoteMissingRowValuesCheck(row)) {
                if (filiereID == null || filiereAbbr == row.filiere.toUpperCase()) {
                    // console.log("filiereID"+filiereID);
                    filiereAbbr = row.filiere.toUpperCase();
                    if (filiereID == null) {
                        // console.log("filiereIDNull"+filiereID);
                      filiere = await Filiere.findOne({
                        where: sequelize.where(
                          sequelize.fn("lower", sequelize.col("abbr")),
                          sequelize.fn("lower", filiereAbbr)
                        ),
                      });
                      filiereID = filiere?.dataValues?.id
                        ? filiere.dataValues.id
                        : null;
                    }
                    
                    // console.log("filiere.dataValues");
                    // console.log(filiere.dataValues.id);
                    // console.log(filiereID);
        
                    if (filiereID != null) {
                        // console.log("filiereID2"+filiereID);
                        let etudiant = null;
                        etudiant = await Etudiant.findOne({
                            where: {
                                code_apogee: row.code_apogee,
                            },
                        });

                        if (etudiant != null && etudiant != undefined) {
                            console.log("etudiant" + filiereID);
                            let anneeUniversitaire = null;
                            anneeUniversitaire = await AnneeUniversitaire.findOne({
                                where: {
                                    annee: row.annee_universitaire,
                                    EtudiantId: etudiant.id,
                                    FiliereId: filiereID,
                                },
                            });

                            if (anneeUniversitaire == null || anneeUniversitaire == undefined) {
                                anneeUniversitaire = await AnneeUniversitaire.create({
                                    annee: row.annee_universitaire,
                                    // EtudiantId: etudiant.dataValues.id,
                                    // FiliereId: filiereID,
                                });
                                etudiant.addAnneeUniversitaire(anneeUniversitaire.id);
                                anneeUniversitaire.setEtudiant(etudiant.dataValues.id);
                                anneeUniversitaire.setFiliere(filiereID);
                            }

                            // console.log("filiereID")
                            // console.log(filiereID)
                            noteRow = await getNoteRow(row, filiereID);
                
                        }
                    }
                }
            }
        })
    )

  }
  
  return res.status(200).send({ message: "Excel file uploaded successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }

}


module.exports = {
  uploadExcelEtudiant,
    uploadExcelNotes,
};

