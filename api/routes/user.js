const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const {signup,signin} = require("../controllers/auth.controller");
router.post("/login", signin);
// router.post("/register-student",[verifyToken,isAdmin], signup);
router.post("/register-student",[verifyToken,isAdmin], signup);
// router.post("/register-admin",[verifyToken,isSuperAdmin], signup);
router.post("/register-admin",[verifyToken,isSuperAdmin], signup);

module.exports = router;