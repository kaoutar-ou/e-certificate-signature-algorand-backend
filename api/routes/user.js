const express = require("express");
const router = express.Router();

const {signin,signup} = require("../controllers/auth.controller");
router.post("/login", signin);
router.post("/signup", signup);

module.exports = router;