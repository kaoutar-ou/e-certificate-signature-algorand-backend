const express = require("express");
const router = express.Router();

const { verifyCertificateAuthenticity } = require('../controllers/blockchain.controller');

router.post("/verify-certificate-authenticity", verifyCertificateAuthenticity);

module.exports = router;