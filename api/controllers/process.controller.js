const fs = require('fs-extra');
const process = require('../../process');



function base64Encode(file) {
    return fs.readFileSync(file, { encoding: 'base64' });
}

const certif = (filename) => {
    return "data:image/png;base64," + base64Encode(filename);
}




const generateCertificate = async (req, res) => {
    const data_ = {
        test: {
            fullName: req.body.fullName,
            image: certif('certiff.png'),
            fileName : "index19.pdf"
        }
    };
    const fileName=  await process.generateCertificate(data_);
    const hash = await process.hashDocument(fileName);
    res.status(200).send({ message: "Certificate generated successfully ! ", fileName, hash });

}


module.exports = {
    generateCertificate
}