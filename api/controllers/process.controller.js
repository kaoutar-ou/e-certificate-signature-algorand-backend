const fs = require('fs-extra');
const process_ = require('../../process');
const path = require('path');
const QRCode = require('qrcode');
const CryptoJS = require("crypto-js");

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

    // const infos = data_.split('_');
    // const object = {
    //     filename : data_,
    //     fullname: infos[0],
    //     filiere: infos[1],
    //     annee_univ: infos[2],
    // }
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
            ministere:ministere? image(path.join(process.cwd(), 'process', 'canvas', `${ministere}.png`)) : null,
            presidence:presidence? image(path.join(process.cwd(), 'process', 'canvas', `${presidence}.png`)): null,
            etablissement:etablissement? image(path.join(process.cwd(), 'process', 'canvas', `${etablissement}.png`)) : null,
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

    students.forEach(async (student) => {
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
                ministere:ministere? image(path.join(process.cwd(), 'process', 'canvas', `${ministere}.png`)) : null,
                presidence:presidence? image(path.join(process.cwd(), 'process', 'canvas', `${presidence}.png`)): null,
                etablissement:etablissement? image(path.join(process.cwd(), 'process', 'canvas', `${etablissement}.png`)) : null,
                fileName: path.join(process.cwd(), 'uploads', 'certificates', `${filename}` + '.pdf')
            }
        };
        await generateQRCode(filename).then(() => {
            data_.test.qr_code = image(path.join(FILE_PATH, `${filename}.png`));
        })
        const fileName = await process_.generateCertificate(data_);
        const hash = await process_.hashDocument(data_.test.fileName);

    })

    res.status(200).json({  
        message: "certificates generated successfully",
        data: students
    })
    
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


module.exports = {
    generateCertificate,
    generateCertificateTest,
    generateForAllStudents
}