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
    const data = encryptFilename(data_)
    var qr_url = "https://www.uca.ma/" + data;
    const opts = {
        errorCorrectionLevel: 'H',
        type: 'terminal',
        quality: 0.95,
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
            console.log("decrypted", decryptFilename(data));
        })
    })

}

const image = (filename) => {
    return "data:image/png;base64," + base64Encode(filename);
}

const generateCertificate = async (req, res) => {
    const fullname = req.body.fullName;
    const plus_info = fullname +"_"+ req.body.filiere + "_" + req.body.annee_univ;

    const filename = plus_info.replace(/\s/g, '-').toLowerCase();
    const data_ = {
        test: {
            fullName: fullname,
            image: image('certiff.png'),
            qr_code: '',
            fileName: path.join(process.cwd(), 'uploads', 'certificates', `${filename}` + '.pdf')
        }
    };
    await generateQRCode(filename).then(() => {
        data_.test.qr_code = image(path.join(FILE_PATH, `${filename}.png`));
    })
    const fileName = await process_.generateCertificate(data_);
    const hash = await process_.hashDocument(data_.test.fileName);
    res.status(200).send({ message: "Certificate generated successfully ! ", hash });

}


module.exports = {
    generateCertificate
}