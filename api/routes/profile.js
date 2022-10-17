const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middleware/auth");

const {studentProfile} = require("../controllers/profile.controller");

router.get("/student-profile", studentProfile);

module.exports = router;