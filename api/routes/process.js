const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middleware/auth");

const { generateCertificate ,generateCertificateTest,generateForAllStudents} = require("../controllers/process.controller")

router.post('/generate-certificate',[verifyToken,isAdmin], generateCertificate);
router.post('/generate-certificate-test', generateCertificateTest);
router.post('/generate-certificates', generateForAllStudents);


module.exports = router;