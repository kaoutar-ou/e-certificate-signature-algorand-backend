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
        
        const content = await compile('index', data_);

        await page.setContent(content);
        await page.emulateMediaType('screen');
        await page.pdf({
            path: data_.test.fileName,
            format: 'A4',
            landscape: true,
            printBackground: true,
        });
        await page.screenshot({ path:  data_.test.thumbnail, fullPage: true });
        await browser.close();


        // console.log("data_-------------")
        // console.log(data_)
        // console.log("content-----------")
        // // console.log(content)
        // console.log("data_.test.fileName-----------")
        // console.log(data_.test.fileName)
        // await phantom.create().then(function(ph) {
        //     ph.createPage().then(function(page) {
        //         page.setContent(content, 'https://www.google.com/').then(function(status) {
        //             page.render("tekst.pdf").then(function() {
        //                 console.log('Page Rendered');
        //                 ph.exit();
        //             });
        //         }
        //         );
        //     });
        // });




//   await page.pdf({
//     path: 'hd-posts.pdf',
//     format: 'A4',
//     margin: {
//         top: '20px',
//         bottom: '20px'
//       },
//     displayHeaderFooter: true,
//     printBackground: true,
//     landscape : true
//   })

//   await browser.close()

//   const browser = await chromium.launch()
//   const page = await browser.newPage()

// //   const navigationPromise = page.waitForNavigation()



// //   await page.goto('https://theheadless.dev/posts')

//   const content = await compile('index', data_);
// // const content = await fs.readFile('./test.html', 'utf8');
//   await page.setContent(content)

// //   await navigationPromise

    
  

// //   await page.pdf({
// //     path: 'hd-posts.pdf',
// //     displayHeaderFooter: true,
// //     margin: {
// //         top: '100px',
// //       bottom: '40px'
// //     },
// //     printBackground: true
// //   })

//           await page.pdf({
//             path: data_.test.fileName,
//             format: 'A4',
//             landscape: true,
//             printBackground: true,
//         });

//   await browser.close()

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


