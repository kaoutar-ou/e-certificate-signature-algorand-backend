const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const { generateCertificate ,generateForAllStudents, sendFile } = require("../controllers/process.controller");

router.post('/generate-certificate', generateCertificate);
router.post('/generate-certificates', generateForAllStudents);
router.get('/get-certificate', sendFile);


module.exports = router;