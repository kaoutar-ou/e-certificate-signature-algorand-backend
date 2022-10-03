const express = require("express");
const router = express.Router();

const { createUniverse, createEtablissement } = require('../controllers/backops.controller');

router.post("/create-university", createUniverse);
router.post("/create-etablissement", createEtablissement);

module.exports = router;