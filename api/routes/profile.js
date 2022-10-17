const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middleware/auth");

const {studentProfile,updateProfileVisibility} = require("../controllers/profile.controller");

router.get("/student-profile", studentProfile);
router.post("/update-profile-visibility", updateProfileVisibility);

module.exports = router;