const express = require("express");
const router = express.Router();

const { sendFile, hashDocument, generateCertification  } = require("../controllers/process.controller");


router.get('/get-certificate', sendFile);
router.post('/hash-document', hashDocument);
router.post('/generate-certification', generateCertification);





module.exports = router;

