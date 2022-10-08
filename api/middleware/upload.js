const multer = require("multer");
const path = require("path");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Excel file expacted", false);
  }
};

const basedir = process.cwd()

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, basedir + "/resources/uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${file.originalname}-${Date.now()}`);
  },
});

let uploadExcelFile = multer({ storage: storage, fileFilter: excelFilter });

module.exports = {
    uploadExcelFile,
}