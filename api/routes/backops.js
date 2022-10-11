const express = require("express");
const router = express.Router();

const { createUniverse, createEtablissement, createFiliere, getAllFilieres, sendEmailTest, getAllEtudiants, createSemestre, createModule } = require('../controllers/backops.controller');

router.post("/create-university", createUniverse);
router.post("/create-etablissement", createEtablissement);
router.post("/create-filiere", createFiliere);

router.get("/get-all-filieres", getAllFilieres);

router.get("/get-all-etudiants", getAllEtudiants);

router.post("/send-email-test", sendEmailTest);

router.post("/create-semestre", createSemestre);

router.post("/create-module", createModule);

module.exports = router;