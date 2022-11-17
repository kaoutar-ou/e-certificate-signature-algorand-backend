const fs = require('fs-extra');
const process_ = require('../../process');
const path = require('path');
const QRCode = require('qrcode');
const CryptoJS = require("crypto-js");

// const models = require("../models");
const Certificat = require('../models/Certificat');
const Etudiant = require('../models/Etudiant');
const Filiere = require('../models/Filiere');
const User = require('../models/User');


const FILE_PATH = path.join(process.cwd(), 'uploads', 'qr-codes');
const KEY = '12345678901234567890123456789012';
const IV = '7061737323313233';

const key = CryptoJS.enc.Utf8.parse(KEY);
const iv = CryptoJS.enc.Utf8.parse(IV);


function base64Encode(file) {
    return fs.readFileSync(file, { encoding: 'base64' });
}


const encryptFilename = (filename) => {

    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(filename), key,
        {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return encrypted.toString();
}
const decryptFilename = (encrypted) => {
    let decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}


const generateQRCode = async (data_) => {


    const encrypted = encryptFilename(data_);
    var qr_url = "https://e-certificate.vr4.ma/verification?hash=" + encrypted;
    const opts = {
        errorCorrectionLevel: 'H',
        type: 'terminal',
        quality: 1,
        margin: 1,
        color: {
            dark: '#208698',
            light: '#FFF',
        },
        width: 100,
        height: 100
    }

    return new Promise((resolve, reject) => {
        fs.ensureDirSync(FILE_PATH);
        QRCode.toFile(path.join(FILE_PATH, `${data_}.png`), qr_url, opts, function (err) {
            if (err) reject(err)
            resolve(true)
            console.log("decrypted", decryptFilename(encrypted));
        })
    })

}

const image = (filename) => {
    return "data:image/png;base64," + base64Encode(filename);
}


const generateForAllStudents = async (req, res) => {

    const students = req.body.students;
    const signers = req.body.signers;
    const date = req.body.date;
    const local = req.body.local;
    const filiere = req.body.filiere;
    const titre_diplome = req.body.titre_diplome;
    const ministere = req.body.ministere;
    const presidence = req.body.presidence;
    const etablissement = req.body.etablissement;
    const template = req.body.template;

    fs.ensureDirSync(path.join(process.cwd(), 'uploads', 'certificates'));

    if (students.length > 0 && signers.length > 0 && titre_diplome !== "" && template !== "" && date !== "" && local !== "" && filiere !== "") {
        Promise.all(students.map(async (student) => {

            if (!fs.existsSync(student.fullName.replace(/\s/g, '-').toLowerCase())) {
                fs.mkdirSync(path.join(process.cwd(), 'uploads', 'certificates', student.cne.replace(/\s/g, '-').toLowerCase()), { recursive: true });
            }
            const plus_info = student.cne + "_" + filiere + "_" + student.annee_univ;
            const filename = plus_info.replace(/\s/g, '-').toLowerCase();
            const data_ = {
                test: {
                    fullName: student.fullName,
                    image: image(path.join(process.cwd(), 'process', 'canvas', `${template}.png`)),
                    qr_code: '',
                    date,
                    local,
                    signer_primary: signers[0],
                    signer_secondary: signers[1],
                    filiere,
                    cin: student.cin,
                    cne: student.cne,
                    mention: student.mention,
                    titre_diplome,
                    ministere: ministere ? image(path.join(process.cwd(), 'process', 'canvas', `${ministere}.png`)) : null,
                    presidence: presidence ? image(path.join(process.cwd(), 'process', 'canvas', `${presidence}.png`)) : null,
                    etablissement: etablissement ? image(path.join(process.cwd(), 'process', 'canvas', `${etablissement}.png`)) : null,
                    fileName: path.join(process.cwd(), 'uploads', 'certificates', student.cne.replace(/\s/g, '-').toLowerCase(), `${filename}` + '.pdf'),

                }
            };
            await generateQRCode(filename).then(() => {
                data_.test.qr_code = image(path.join(FILE_PATH, `${filename}.png`));
            })
            fs.ensureDirSync(path.join(process.cwd(), 'uploads', 'certificates'));

            const fileName = await process_.generateCertificate(data_);
            const hash = await process_.hashDocument(data_.test.fileName);

            const student_ = await Etudiant.findOne({ where: { cne: student.cne } });


            console.log(filiere)

            const filiere_ = await Filiere.findOne({ where: { abbr: filiere } });

            console.log(filiere_)
            const certificat = await Certificat.create({
                fileName: encryptFilename(filename),
            });
            console.log("🚀 ~ file: process.controller.js ~ line 230 ~ generateCertificate ~ certificat", certificat)


            await certificat.setEtudiant(student_.dataValues.id);
            await certificat.setFiliere(filiere_.dataValues.id);

            console.log("🚀 ~ file: process.controller.js ~ line 236 ~ generateCertificate ~ certificat", certificat)

            await student_.addCertificat(certificat);

            console.log("🚀 ~ file: process.controller.js ~ line 239 ~ generateCertificate ~ student_", student_)
           

        })).then(() => {

            res.status(200).json({
                message: "certificates generated successfully",
            })
        }).catch((err) => {
            console.log(err)
            res.status(500).json({
                message: "error while generating certificates",
                error: err
            })
        })


    }
    else {
        res.status(400).json({
            message: "please fill all the fields",
        })
    }

}

const generateCertificate = async (req, res) => {


    console.log("req.signers", req);
    const fullname = req.body.fullName;
    const date = req.body.date;
    const local = req.body.local;
    const signers = req.body.signers;
    const filiere = req.body.filiere;
    const cin = req.body.cin;
    const cne = req.body.cne;
    const mention = req.body.mention;
    const titre_diplome = req.body.titre_diplome;
    const ministere = req.body.ministere;
    const presidence = req.body.presidence;
    const etablissement = req.body.etablissement;
    const template = req.body.template;

    const plus_info = fullname + "_" + req.body.filiere + "_" + req.body.annee_univ;

    const filename = plus_info.replace(/\s/g, '-').toLowerCase();
    const data_ = {
        test: {
            fullName: fullname,
            image: image(path.join(process.cwd(), 'process', 'canvas', `${template}.png`)),
            qr_code: '',
            date,
            local,
            signer_primary: signers[0],
            signer_secondary: signers[1],
            filiere,
            cin,
            cne,
            mention,
            titre_diplome,
            ministere: ministere ? image(path.join(process.cwd(), 'process', 'canvas', `${ministere}.png`)) : null,
            presidence: presidence ? image(path.join(process.cwd(), 'process', 'canvas', `${presidence}.png`)) : null,
            etablissement: etablissement ? image(path.join(process.cwd(), 'process', 'canvas', `${etablissement}.png`)) : null,
            fileName: path.join(process.cwd(), 'uploads', 'certificates', `${filename}` + '.pdf')
        }
    };

    await generateQRCode(filename).then(() => {
        data_.test.qr_code = image(path.join(FILE_PATH, `${filename}.png`));
    })
    fs.ensureDirSync(path.join(process.cwd(), 'uploads', 'certificates'));

    const fileName = await process_.generateCertificate(data_);
    const hash = await process_.hashDocument(data_.test.fileName);

    const student_ = await Etudiant.findOne({ where: { cne: cne } });


    console.log(filiere)

    const filiere_ = await Filiere.findOne({ where: { abbr: filiere } });

    console.log(filiere_)
    const certificat = await Certificat.create({
        fileName: encryptFilename(filename),
    });
    console.log("🚀 ~ file: process.controller.js ~ line 230 ~ generateCertificate ~ certificat", certificat)


    await certificat.setEtudiant(student_.dataValues.id);
    await certificat.setFiliere(filiere_.dataValues.id);

    console.log("🚀 ~ file: process.controller.js ~ line 236 ~ generateCertificate ~ certificat", certificat)

    await student_.addCertificat(certificat);
    console.log("🚀 ~ file: process.controller.js ~ line 239 ~ generateCertificate ~ student_", student_)

    console.log("certificat", certificat);
    res.status(200).json({
        message: "certificate generated successfully",
        data: {
            fileName: fileName,
        }
    })


}

const sendFile = async (req, res) => {

    const filename = decryptFilename(req.query.hash.replace(/ /g, '+'));
    console.log("----------------------filename-----------------------");
    console.log(filename);
    console.log("filename", filename);
    const file = path.join(process.cwd(), 'uploads', 'certificates', filename.split('_')[0], `${filename}` + '.pdf');
    console.log(file)

    const fileExists = await fs.existsSync(file);
    if (fileExists) {

        res.header('Content-Type', 'application/pdf');
        res.header('Content-Disposition', 'attachment; filename=' + filename + '.pdf');
        // res.sendFile(file);
        var data = fs.readFileSync(file);
        res.contentType("application/pdf");
        res.send(data);
    }
    else {
        res.status(404).json({
            message: "Certificate not found"
        })
    }
}

const displayStudentInfo = async (req, res) => {

    const hash = req.query.hash.replace(/ /g, '+');
    console.log("hash", hash);
    const data = decryptFilename(hash);
    console.log("data", data.split('_')[0]);
    const student = await Etudiant.findOne({ where: { cne: data.split('_')[0].toUpperCase() }, include: [{ model: User, as: 'User' }] });
    const { nom, prenom, email, ...rest } = student.User;
    const filiere = await Filiere.findOne({ where: { abbr: data.split('_')[1].toUpperCase() } });

   
 

    // order filiere keys 
    const ordered = {};
    Object.keys(filiere.dataValues).sort().forEach(function (key) {
        ordered[key] = filiere.dataValues[key];
    });

    const certificat = await Certificat.findOne({ where: { fileName: hash } });

    const removeUnwantedData = (data) => {

        const {
            createdAt,
            updatedAt,
            User,
            id,
            cin,
            pays,
            ville,
            date_naissance,
            date_inscription,
            date_sortie,
            UserId,
            address,
            telephone,
            avatar,
            visibility,
            ...rest } = data;

        return rest;
    }

    const studentInfo = { nom, prenom, email ,... removeUnwantedData(student.dataValues) };


    res.status(200).json({
        student: studentInfo,
        filiere: {Diplôme :  filiere.diplome , Libelé : filiere.nom , Description : filiere.description },
        certificat: certificat,
    })
}


const updateCertificat = async(certificateInfo) =>{
    const txnHash = certificateInfo.txnId;
    const id = certificateInfo.certificateId;

    // const certificat = await Certificat.findOne({ where: { id: id } });
    const certificat = await Certificat.findByPk(id);
    
    if (certificat) {
        await Certificat.update({ txnHash }, { where: { id: id } });

        // res.status(200).json({
        //     message: "certificat updated successfully",
        // })
        return true;
    }
    else {
        return false;
        // console.log("certificat not found");
        // res.status(404).json({
        //     message: "certificat not found"
        // })
    }
}
  

    
    





module.exports = {
    generateForAllStudents,
    generateCertificate,
    sendFile,
    displayStudentInfo,
    updateCertificat,
    decryptFilename
}