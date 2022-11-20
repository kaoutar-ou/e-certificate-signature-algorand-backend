const express = require("express");
const router = express.Router();

const {uploadProfileImage,downloadAvatar} = require("../controllers/profile.controller");



router.post("/upload-avatar", uploadProfileImage);
router.get("/download-avatar", downloadAvatar);




module.exports = router;