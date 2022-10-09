const express = require("express");
const router = express.Router();

const { createUniverse, createEtablissement, createFiliere, getAllFilieres, sendEmailTest } = require('../controllers/backops.controller');

router.post("/create-university", createUniverse);
router.post("/create-etablissement", createEtablissement);
router.post("/create-filiere", createFiliere);

router.get("/get-all-filieres", getAllFilieres);

router.post("/send-email-test", sendEmailTest);

module.exports = router;