const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const crypto = require('crypto');
const hbs = require('handlebars');
const { fromPath } = require("pdf2pic");
const path = require('path');


const compile = async function (templateName, data) {
    const filePath = path.join(process.cwd(), 'process', 'templates', `${templateName}.hbs`);
    const html = await fs.readFile(filePath, 'utf-8');
    return hbs.compile(html)(data);
}




const generateCertificate = async (data_) => {

    try {
        const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files', '--enable-local-file-accesses'] });
        const page = await browser.newPage();
        const content = await compile('index', data_);
        await page.setContent(content);
        await page.emulateMediaType('screen');
        await page.pdf({
            path: data_.test.fileName,
            format: 'A4',
            landscape: true,
            printBackground: true,
        });
        // await page.screenshot({ path:  data_.test.thumbnail, fullPage: true });
        await browser.close();

    }
    catch (e) {
        console.log(e);
    }
    return data_.test.fileName;

}


const hashDocument = async (filename) => {
    const filereader = await fs.readFile(filename);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(filereader);
    const hex = hashSum.digest('hex');
    console.log(hex);
    return hex;
}
// hashDocument(path.join(process.cwd(), 'uploads', 'certificates', 'oubenaddi-kaoutar', 'oubenaddi-kaoutar_irisi_2022-2023.pdf'));
module.exports = {
    generateCertificate,
    hashDocument,

}


