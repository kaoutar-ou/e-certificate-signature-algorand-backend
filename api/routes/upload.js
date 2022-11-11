const express = require("express");
const { uploadExcelEtudiant, uploadExcelNotes } = require("../controllers/upload.controller");
const { verifyToken, isAdmin } = require("../middlwares/auth");
const { uploadExcelFile } = require("../middlwares/upload");
const router = express.Router();

router.post("/etudiant-excel", [verifyToken,isAdmin,uploadExcelFile.single("file")], uploadExcelEtudiant);
router.post("/note-excel", [verifyToken,isAdmin,uploadExcelFile.single("file")], uploadExcelNotes);


module.exports = router;