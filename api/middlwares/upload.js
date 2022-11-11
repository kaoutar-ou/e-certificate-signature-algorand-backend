const multer = require("multer");
const path = require("path");
const fs = require('fs')

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Excel file expected", false);
  }
};

const pdfFilter = (req, file, cb) => {
  console.log("file.mimetype");
  console.log(file.mimetype);
  if (
    file.mimetype.includes("pdf") ||
    file.mimetype.includes("PDF")
  ) {
    cb(null, true);
  } else {
    cb("Pdf file expected", false);
  }
};

const basedir = process.cwd()
const dir = path.join(basedir, "uploads", "excel");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(dir)) {
        fs.mkdir(dir, error => error ? console.log(error) : console.log('You have created ' + dir) ) ;
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

let uploadExcelFile = multer({ storage: storage, fileFilter: excelFilter });
let uploadPdfFile = multer({ storage: storage, fileFilter: pdfFilter });

module.exports = {
    uploadExcelFile,
    uploadPdfFile
}