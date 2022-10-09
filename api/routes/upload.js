const express = require("express");
const { uploadExcelEtudiant } = require("../controllers/upload.controller");
const { uploadExcelFile } = require("../middleware/upload");
const router = express.Router();

router.post("/etudiant-excel", uploadExcelFile.single("file"), uploadExcelEtudiant);


module.exports = router;