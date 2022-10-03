const express = require("express");
const router = express.Router();

const { createUniverse, createEtablissement, createFiliere } = require('../controllers/backops.controller');

router.post("/create-university", createUniverse);
router.post("/create-etablissement", createEtablissement);
router.post("/create-filiere", createFiliere);

module.exports = router;