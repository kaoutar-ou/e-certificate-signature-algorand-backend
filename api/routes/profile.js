const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const {studentProfile,updateProfileVisibility,studentPrivateProfile,uploadProfileImage,downloadAvatar} = require("../controllers/profile.controller");


router.get("/student-profile", studentProfile);
router.get("/student-private-profile", studentPrivateProfile);
router.post("/update-profile-visibility", updateProfileVisibility);
router.post("/upload-avatar", uploadProfileImage);
router.get("/download-avatar", downloadAvatar);


module.exports = router;