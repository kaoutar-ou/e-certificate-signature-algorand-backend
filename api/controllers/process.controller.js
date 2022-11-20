const fs = require('fs-extra');
const path = require('path');
const CryptoJS = require("crypto-js");



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



  

    
    





module.exports = {
    sendFile,
    decryptFilename
}