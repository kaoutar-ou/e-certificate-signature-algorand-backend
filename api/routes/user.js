const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middleware/auth");

const {signin,signup} = require("../controllers/auth.controller");
router.post("/login", signin);
router.post("/register-student",[verifyToken,isAdmin], signup);
router.post("/register-admin",[verifyToken,isSuperAdmin], signup);

module.exports = router;