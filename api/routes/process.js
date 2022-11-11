const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const { generateCertificate ,generateForAllStudents, sendFile , displayStudentInfo } = require("../controllers/process.controller");

router.post('/generate-certificate',[verifyToken,isAdmin], generateCertificate);
router.post('/generate-certificates',[verifyToken,isAdmin], generateForAllStudents);
router.get('/get-certificate', sendFile);
router.get('/get-student-info', displayStudentInfo);




module.exports = router;

