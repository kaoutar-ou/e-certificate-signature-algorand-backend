const express = require("express");
const router = express.Router();


const {
      uploadProfileImage,
      uploadFile
 
} = require('../controllers/backops.controller');


router.post("/upload-profile-image", uploadProfileImage);
router.post("/upload-file", uploadFile);


module.exports = router;