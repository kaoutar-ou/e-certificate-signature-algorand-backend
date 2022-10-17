const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middleware/auth");

const { generateCertificate ,generateCertificateTest,generateForAllStudents , sendFile} = require("../controllers/process.controller")

router.post('/generate-certificate',[verifyToken,isAdmin], generateCertificate);
router.post('/generate-certificate-test', generateCertificateTest);
router.post('/generate-certificates', generateForAllStudents);
router.get('/get-certificate', sendFile);


module.exports = router;