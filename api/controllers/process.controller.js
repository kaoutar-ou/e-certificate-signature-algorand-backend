const fs = require('fs-extra');
const path = require('path');
const CryptoJS = require("crypto-js");
const crypto = require('crypto');
const { generateCertificate } = require('../../process');
const FormData = require('form-data');
const axios = require('axios');
const QRCode = require('qrcode');

const KEY = '12345678901234567890123456789012';
const IV = '7061737323313233';

const key = CryptoJS.enc.Utf8.parse(KEY);
const iv = CryptoJS.enc.Utf8.parse(IV);




const decryptFilename = (encrypted) => {
    let decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}








const sendFile = async (req, res) => {

    const filename = decryptFilename(req.query.hash.replace(/ /g, '+'));

    const file = path.join(process.cwd(), 'uploads', 'certificates', filename.split('_')[0], `${filename}` + '.pdf');

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



const hashDocument = async (req, res) => {
    // console.log(req.body);
    console.log("documentHash");
    const { certificate } = req.body;
    console.log(req.body);
    const folderName = certificate.Etudiant.cne
    const fileName = decryptFilename(certificate.fileName);
    documentHash = await hashDocumentFct(path.join(process.cwd(), 'uploads', 'certificates', folderName, fileName+".pdf"));

    documentHash = Buffer.from(documentHash).toString('base64');

    console.log("documentHash");
    console.log(documentHash);
    res.status(200).json({
        documentHash
    })
}

  
const hashDocumentFct = async (filename) => {
    const filereader = await fs.readFile(filename);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(filereader);
    const hex = hashSum.digest('hex');

    let unsignedIntegers = hex.match(/[\dA-F]{2}/gi).map(function(s) {
        return parseInt(s, 16);
      });
    let typedArray = new Uint8Array(unsignedIntegers);
    // console.log(typedArray);
    return typedArray;
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

const FILE_PATH = path.join(process.cwd(), 'uploads', 'qr-codes');

const generateQRCode = async (data_) => {


    const encrypted = encryptFilename(data_);
    var qr_url = "https://e-certification.vr4.ma/verification?hash=" + encrypted;
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


function base64Encode(file) {
    return fs.readFileSync(file, { encoding: 'base64' });
}

const image = (filename) => {
    return "data:image/png;base64," + base64Encode(filename);
}


const generateCertification = async (req, res) => {
    const data = req.body.data;

    console.log(data);
    const student = req.body.student;

    data.test.image = image(path.join(process.cwd(), 'process', 'canvas', `${data.general.template}.png`))
    data.test.ministere = data.general.ministere ? image(path.join(process.cwd(), 'process', 'canvas', `${data.general.ministere}.png`)) : null
    data.test.presidence = data.general.presidence ? image(path.join(process.cwd(), 'process', 'canvas', `${data.general.presidence}.png`)) : null
    data.test.etablissement = data.general.etablissement ? image(path.join(process.cwd(), 'process', 'canvas', `${data.general.etablissement}.png`)) : null
    data.test.fileName = path.join(process.cwd(), 'uploads', 'certificates', student.cne.replace(/\s/g, '-').toLowerCase(), `${data.general.fileName}` + '.pdf')

    fs.ensureDirSync(path.join(process.cwd(), 'uploads', 'certificates'));

    if (!fs.existsSync(student.fullName.replace(/\s/g, '-').toLowerCase())) {
        fs.mkdirSync(path.join(process.cwd(), 'uploads', 'certificates', student.cne.replace(/\s/g, '-').toLowerCase()), { recursive: true });
    }

    await generateQRCode(data.general.fileName).then(() => {
        data.test.qr_code = image(path.join(FILE_PATH, `${data.general.fileName}.png`));
    })

    try {
        const fileName = await generateCertificate(data);
        await serverToServer(student, fileName);
        console.log("fileName");
        res.status(200).json({
            message: "Certificate generated successfully",
            fileName
        })
    } catch (error) {
        console.log(error);
        console.log("error");
        res.status(500).json({
            message: "Error"
        })
    }
}






const serverToServer = async (student, fileName) => {

    console.log(fileName)

    const formData = new FormData();
    formData.append('apogee', student.cne.toLowerCase());
    formData.append('file', fs.createReadStream(fileName));
    
    try {
        // const response = await axios.post('http://localhost:7000/api/backops/upload-file', formData);
        const response = await axios.post('https://e-certificate-server.vr4.ma/api/backops/upload-file', formData);
        console.log(response);
    } catch (error) {
        console.error(error);
    }
      
}










module.exports = {
    sendFile,
    decryptFilename,
    hashDocument,
    generateCertification
}