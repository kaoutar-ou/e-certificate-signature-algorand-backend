const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middleware/auth");

const { generateCertificate ,generateCertificateTest} = require("../controllers/process.controller")

router.post('/generate-certificate',[verifyToken,isAdmin], generateCertificate);
router.post('/generate-certificate-test', generateCertificateTest);

module.exports = router;