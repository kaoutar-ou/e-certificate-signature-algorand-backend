// const phantom = require('phantom');
 
// (async function() {
//   const instance = await phantom.create();
//   const page = await instance.createPage();
//   await page.on('onResourceRequested', function(requestData) {
//     console.info('Requesting', requestData.url);
//   });
 
//   const status = await page.open('https://stackoverflow.com/');
//   const content = await page.property('content');
//   console.log(content);
 
//   await instance.exit();
// })();

// phantom.create().then(function(ph) {
//     ph.createPage().then(function(page) {
//         page.open("http://www.google.com").then(function(status) {
//             page.render('google.pdf').then(function() {
//                 console.log('Page Rendered');
//                 ph.exit();
//             });
//         });
//     });
// });

// phantom.create().then(function(ph) {
//     ph.createPage().then(function(page) {
//         page.setContent('<html><body><h1>Test</h1></body></html>', 'https://www.google.com/').then(function(status) {
//             page.render('test.pdf').then(function() {
//                 console.log('Page Rendered');
//                 ph.exit();
//             });
//         }
//         );
//     });
// });



// const { chromium } = require('playwright')
// const fs = require('fs');

// (async () => {
//   const browser = await chromium.launch()
//   const page = await browser.newPage()

//   const navigationPromise = page.waitForNavigation()

// //   const templateHeader = fs.readFileSync('template-header.html', 'utf-8')
// //   const templateFooter = fs.readFileSync('template-footer.html', 'utf-8')

//   await page.goto('https://google.com')

//   await navigationPromise

//   await page.waitForSelector('.accept', { visible: true })
//   await page.evaluate(() => document.querySelector('.accept').click())
//   await page.waitForSelector('.accept', { hidden: true })

//   await page.pdf({
//     path: 'hd-posts.pdf',
//     displayHeaderFooter: true,
//     headerTemplate: templateHeader,
//     footerTemplate: templateFooter,
//     margin: {
//       top: '100px',
//       bottom: '40px'
//     },
//     printBackground: true
//   })

//   await browser.close()
// })()



// ///////////////////////////////////////////////////////////////////////

// const { chromium } = require('playwright')
// const fs = require('fs-extra');

// (async () => {
//   const browser = await chromium.launch()
//   const page = await browser.newPage()

//   const navigationPromise = page.waitForNavigation()

//   await page.goto('https://theheadless.dev/posts')

//   await navigationPromise

//     // page.setContent()

//   await page.pdf({
//     path: 'hd-posts.pdf',
//     displayHeaderFooter: true,
//     margin: {
//         top: '100px',
//       bottom: '40px'
//     },
//     printBackground: true
//   })

//   await browser.close()
// })()


// ///////////////////////////////////////////////////////////////////////

