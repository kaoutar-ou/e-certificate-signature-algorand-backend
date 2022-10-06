const express = require("express");
const router = express.Router();

const { generateCertificate } = require("../controllers/process.controller")

router.post('/generate-certificate', generateCertificate);

module.exports = router;