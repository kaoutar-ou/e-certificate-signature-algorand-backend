const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const { getAlgodClient, sendRawTransaction, verifyCertificateAuthenticity, verifyAttachedCertificate } = require('../controllers/blockchain.controller');
const { uploadPdfFile } = require("../middlwares/upload");

router.post("/get-algod-client", getAlgodClient);
router.post("/send-raw-transaction", sendRawTransaction);
router.post("/verify-certificate-authenticity", verifyCertificateAuthenticity);
router.post("/verify-attached-certificate", verifyAttachedCertificate);

module.exports = router;