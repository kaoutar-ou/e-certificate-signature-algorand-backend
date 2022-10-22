const express = require("express");
const { uploadExcelEtudiant, uploadExcelNotes } = require("../controllers/upload.controller");
const { uploadExcelFile } = require("../middleware/upload");
const router = express.Router();

router.post("/etudiant-excel", uploadExcelFile.single("file"), uploadExcelEtudiant);
router.post("/note-excel", uploadExcelFile.single("file"), uploadExcelNotes);


module.exports = router;