const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const crypto = require('crypto');
const hbs = require('handlebars');
const path = require('path');


// const { chromium } = require('playwright')
// const fs = require('fs-extra');

const compile = async function (templateName, data) {
    const filePath = path.join(process.cwd(), 'process', 'templates', `${templateName}.hbs`);
    const html = await fs.readFile(filePath, 'utf-8');
    return hbs.compile(html)(data);
}




const generateCertificate = async (data_) => {

    try {
        // const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files', '--enable-local-file-accesses'] });
        const browser = await puppeteer.launch(
            {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',

                ],
            }
        );
        const page = await browser.newPage();
        
        console.log('1')
        const content = await compile('index', data_);

        console.log('2')

        await page.setContent(content);
        await page.emulateMediaType('screen');

        console.log('3')

        await page.pdf({
            path: data_.test.fileName,
            format: 'A4',
            landscape: true,
            printBackground: true,
        });

        console.log('4')

        await page.screenshot({ path:  data_.test.thumbnail, fullPage: true });
        await browser.close();

    }
    catch (e) {
        console.log("----------------------------------------------dd---------");
        console.log(e);
    }
    return data_.test.fileName;

}


const hashDocument = async (filename) => {
    const filereader = await fs.readFile(filename);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(filereader);
    const hex = hashSum.digest('hex');

    let unsignedIntegers = hex.match(/[\dA-F]{2}/gi).map(function(s) {
        return parseInt(s, 16);
      });
    let typedArray = new Uint8Array(unsignedIntegers);
    console.log(typedArray);
    return typedArray;
}




module.exports = {
    generateCertificate,
    hashDocument,

}


