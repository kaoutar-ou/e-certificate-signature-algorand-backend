const fs = require('fs-extra');
const process_ = require('../../process');
const path = require('path');
const QRCode = require('qrcode');
const CryptoJS = require("crypto-js");
const models = require("../models");
const Certificat = require('../models/certificat');
const Etudiant = require('../models/etudiant');
const Filiere = require('../models/filiere');


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
    var qr_url = "http://localhost:22840/verification/" + encrypted;
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
    const fileName = await process_.generateCertificate(data_);
    const hash = await process_.hashDocument(data_.test.fileName);


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
                fs.mkdirSync(path.join(process.cwd(), 'uploads', 'certificates', student.fullName.replace(/\s/g, '-').toLowerCase()), { recursive: true });
            }
            const plus_info = student.fullName + "_" + filiere + "_" + student.annee_univ;
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
                    fileName: path.join(process.cwd(), 'uploads', 'certificates', student.fullName.replace(/\s/g, '-').toLowerCase(), `${filename}` + '.pdf'),

                }
            };
            await generateQRCode(filename).then(() => {
                data_.test.qr_code = image(path.join(FILE_PATH, `${filename}.png`));
            })
            const fileName = await process_.generateCertificate(data_)
            const hash = await process_.hashDocument(data_.test.fileName);

            const student_ = await Etudiant.findOne({ cne: student.cne });
            console.log(filiere)
            const filiere_ = await Filiere.findOne({ abbr: filiere });
            console.log("student_", student_);
            console.log("filiere_", filiere_);  

            console.log('hello 1 ')
            var certificat = new models.certificat({
                etudiant: student_._id,
                filiere: filiere_._id,
                fileName: encryptFilename(filename),
            });
            console.log('hello')

            console.log("certificat", certificat);

            const savedCertificat = await certificat.save();

            student_.certificats.push(savedCertificat._id);

            await student_.save();


        })).then(() => {

            res.status(200).json({
                message: "certificates generated successfully",
            })
        }).catch((err) => {
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


const generateCertificateTest = async (req, res) => {
    const fullname = "Oubenaddi Kaoutar";


    const plus_info = fullname + "_test_2021-2022";

    const filename = plus_info.replace(/\s/g, '-').toLowerCase();
    const data_ = {
        test: {
            fullName: fullname,
            image: image(path.join(process.cwd(), 'process', 'canvas', 'certif_7.png')),
            qr_code: image(path.join(FILE_PATH, `mouzafir-abdelhadi_irisi_2021-2022.png`)),
            date: "12/02/2022",
            local: "Marrakech",
            signer_primary: { fullname: "Aziz taarabt", position: "Président de l'UCA , au nom du monsieur le président de la part du ministère education supérieur." },
            signer_secondary: { fullname: "Mouha taourirt", position: "Monsieur le Doyen , de la Faculté des Sciences et Techniques ." },
            filiere: "Ingeénierie des Réseaux et Systèmes d'Information",
            cin: "JB45450",
            cne: "D132748956",
            mention: "Très bien",
            titre_diplome: "Ingénieur d'état",
            ministere: image(path.join(process.cwd(), 'process', 'canvas', 'ministere_2.png')),
            presidence: image(path.join(process.cwd(), 'process', 'canvas', 'uca.png')),
            etablissement: image(path.join(process.cwd(), 'process', 'canvas', 'fst.png')),
            fileName: path.join(process.cwd(), 'uploads', 'certificates', `${filename}` + '.pdf')
        }
    };
    // await generateQRCode(filename).then(() => {
    //     data_.test.qr_code = image(path.join(FILE_PATH, `${filename}.png`));
    // })
    const fileName = await process_.generateCertificate(data_);
    // const hash = await process_.hashDocument(data_.test.fileName);
    res.status(200).send({ message: "Certificate generated successfully ! " });

}

const sendFile = async (req, res) => {
    console.log("sendFile");
    console.log("🚀 ~ file: process.controller.js ~ line 235 ~ sendFile ~ req", req.query.hash.replace(/\s/g, '+'))
    const filename = decryptFilename(req.query.hash.replace(/ /g, '+'));
    console.log(filename);
    const file = path.join(process.cwd(), 'uploads', 'certificates', filename.split('_')[0], `${filename}` + '.pdf');
    console.log(file);
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


module.exports = {
    generateCertificate,
    generateCertificateTest,
    generateForAllStudents,
    sendFile
}