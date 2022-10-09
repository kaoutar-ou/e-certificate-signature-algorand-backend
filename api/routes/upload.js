const express = require("express");
const { uploadExcel } = require("../controllers/upload.controller");
const { uploadExcelFile } = require("../middleware/upload");
const router = express.Router();

router.post("/etudiant-excel", uploadExcelFile.single("file"), uploadExcel);


module.exports = router;