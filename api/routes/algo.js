const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const { getAlgodClient } = require('../controllers/blockchain.controller');

router.post("/get-algod-client", getAlgodClient);

module.exports = router;