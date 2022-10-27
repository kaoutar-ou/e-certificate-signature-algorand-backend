const utils = require("../utils/blockchain");
const algosdk = require("algosdk");

const getAlgodClient = async (req, res) => {

    let network = req.params.network ? req.params.network.toUpperCase() : "TESTNET";

    const algodClient = utils.getAlgodClient(network);

    return res.status(200).send(algodClient);
}


module.exports = {
    getAlgodClient
}