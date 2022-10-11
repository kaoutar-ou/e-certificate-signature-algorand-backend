const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middleware/auth");

const { createUniverse, createEtablissement, createFiliere, getAllFilieres, sendEmailTest, getAllEtudiants, createSemestre, createModule } = require('../controllers/backops.controller');

router.post("/create-university", [verifyToken,isSuperAdmin],createUniverse);
router.post("/create-etablissement", [verifyToken,isSuperAdmin],createEtablissement);
router.post("/create-filiere",[verifyToken,isSuperAdmin], createFiliere);

router.get("/get-all-filieres",[verifyToken,isAdmin], getAllFilieres);

router.get("/get-all-etudiants",[verifyToken,isAdmin], getAllEtudiants);

router.post("/send-email-test", sendEmailTest);

router.post("/create-semestre", createSemestre);

router.post("/create-module", createModule);

module.exports = router;