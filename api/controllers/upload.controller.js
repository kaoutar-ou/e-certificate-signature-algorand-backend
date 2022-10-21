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
const { excelEtudiantMissingRowsCheck } = require("../utils/upload");
const User = require("../models/User");

const basedir = process.cwd();
const dir = path.join(basedir, "uploads", "excel");

const uploadExcelEtudiant = async (req, res) => {
    if (req.file == undefined || req.file == null || req.file?.filename == undefined || req.file?.filename == null) {
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
        where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', filiereAbbr))
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
        console.log(data);
        totalRows += data.length;

        const missingRowsCheck = excelEtudiantMissingRowsCheck(data[0])
        if(missingRowsCheck != null) {
            return res.status(400).send({ message: missingRowsCheck });
        }

        await Promise.all(data.map(async (row) => {
            
        if (filiereID == null || filiereAbbr == row.filiere.toUpperCase() ) {
            filiereAbbr = row.filiere.toUpperCase();
            if (filiereID == null) {
                filiere = await Filiere.findOne({
                    where: sequelize.where(sequelize.fn('lower', sequelize.col('abbr')), sequelize.fn('lower', filiereAbbr))
                });
                filiereID = filiere?.dataValues?.id ? filiere.dataValues.id : null;
            }

            if (filiereID =! null) {
                
                let existantUser = await User.findOne({
                    where: {
                        [sequelize.col('cin')] : [row.cin]
                    }
                });

                if (existantUser == null || existantUser == undefined) {
                    let user = await User.create({
                        nom: row.nom,
                        prenom: row.prenom,
                        cin: row.cin,
                        email: generateEmail(row.nom, row.prenom, ["etudiant"]),
                        username: generateUsername(row.nom, row.prenom),
                        password: generatePassword(16).hash,
                    });
                    user.setRoles([roleID]);

                    let etudiant = await user.createEtudiant({
                        cne: row.cne,
                        code_apogee: row.code_apogee,
                        date_naissance: row.date_naissance,
                        telephone: row.telephone,
                        address: row.adresse,
                        ville: row.ville,
                        pays: row.pays,
                        date_inscription: row.date_inscription,
                        user: user._id,
                        date_sortie: null,
                    });



                    // user.addFiliere([filiereID]);
                    studentCount++;
                }
            }

            
        }   

        }));

    }
    return res.send({ message: "File uploaded successfully: " + req.file.originalname });
}


module.exports = {
    uploadExcelEtudiant,
}


// await Promise.all(data.map(async (row) => {
//     let user = {
//         nom: row.nom,
//         prenom: row.prenom,
//         cin: row.cin,
//         filiereID: filiereID,
//     };

//     user.username = generateUsername(user.nom, user.prenom);
//     user.email = generateEmail(user.nom, user.prenom);
//     const password = generatePassword(16);
//     user.password = password.hash;

//     try {
//         user = await User.create(user);
//         user.setRoles([roleID]).then(() => {
//             console.log("User was registered successfully!");
//         }).catch((error) => {
//             console.log("error");
//             console.log("error", error);
//         });
//         studentCount++;
//     } catch (error) {
//         console.log("error");
//         console.log("error", error);
//     }
// }));