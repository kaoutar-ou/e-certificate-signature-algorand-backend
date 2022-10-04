const express = require("express");
const router = express.Router();

const { createUniverse, createEtablissement, createFiliere, getAllFilieres } = require('../controllers/backops.controller');

router.post("/create-university", createUniverse);
router.post("/create-etablissement", createEtablissement);
router.post("/create-filiere", createFiliere);

router.get("/get-all-filieres", getAllFilieres);

module.exports = router;