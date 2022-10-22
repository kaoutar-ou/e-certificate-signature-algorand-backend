const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const { generateCertificate ,generateForAllStudents } = require("../controllers/process.controller");

router.post('/generate-certificate', generateCertificate);
router.post('/generate-certificates', generateForAllStudents);

module.exports = router;