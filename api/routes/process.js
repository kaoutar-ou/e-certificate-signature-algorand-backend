const express = require("express");
const router = express.Router();

const { sendFile  } = require("../controllers/process.controller");


router.get('/get-certificate', sendFile);





module.exports = router;

