const express = require("express");
const router = express.Router();
const {verifyToken,isSuperAdmin,isAdmin} = require("../middlwares/auth");

const { getAlgodClient, sendRawTransaction } = require('../controllers/blockchain.controller');

router.post("/get-algod-client", getAlgodClient);
router.post("/send-raw-transaction", sendRawTransaction);

module.exports = router;