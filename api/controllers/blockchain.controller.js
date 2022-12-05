const algosdk = require("algosdk");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");

const verifyCertificateAuthenticity = async (req, res) => {
    // let algoHashResponse = await axios.get("https://algoindexer.testnet.algoexplorerapi.io/v2/transactions/" + "QJHPC3XIPQVV4BDXYPAQNPOH5XS4RY3HPXGQTJCYLEMJSOLV3S2Q");
    
    // res.status(200).send({data: algoHashResponse.data});

    const data = req.body.data;

    const indexerClient = getIndexerClient("TESTNET");

    try {
        let response = await indexerClient.lookupTransactionByID(data.txnHash).do();

        if (response) {
            response = response.transaction['created-asset-index'];
            response = await indexerClient.lookupAssetByID(response).do();
            response = response.asset.params['metadata-hash'];

            if (data.documentHash === response || data.documentHash === JSON.stringify(response) || Buffer.from(data.documentHash).toString('base64') === JSON.stringify(response) || Buffer.from(data.documentHash).toString('base64') === response.toString()) {
                // if (response == data.documentHash) {
                res.status(200).send({data: "Certificate is authentic", verified: true});
            } else {
                res.status(200).send({data: "Certificate is not authentic", response, verified: false});
            }
        } else {
            res.status(200).send({data: "Certificate is not authentic", response, verified: false});
        }
    } catch (e) {
        res.status(200).send({data: "Certificate is not authentic", response, verified: false});
    }

}

const getIndexerClient = (network) => {
    const { indexer } = getNetworkCredentials(network);
    console.log(indexer);
    const indexerClient = new algosdk.Indexer(
        { "X-API-Key": indexer.token },
        indexer.address,
        indexer.port
    );

    return indexerClient;
};

const getNetworkCredentials = (network) => {
    // localhost
    let algod_token = process.env.ALGOD_TOKEN;
    let algod_address = process.env.ALGOD_SERVER;
    let algod_port = process.env.ALGOD_PORT;

    let kmd_token = process.env.KMD_TOKEN;
    let kmd_address = process.env.KMD_SERVER;
    let kmd_port = process.env.KMD_PORT;

    let indexer_token = process.env.INDEXER_TOKEN;
    let indexer_address = process.env.INDEXER_SERVER;
    let indexer_port = process.env.INDEXER_PORT;

    switch (network) {
        case "TESTNET":
            // is token json?
            try {  
                algod_token = JSON.parse(process.env.ALGOD_TOKEN_TESTNET); 
                indexer_token = JSON.parse(process.env.INDEXER_ADDR_TESTNET);
                
            } catch (e) {
                algod_token = process.env.ALGOD_TOKEN_TESTNET;
                indexer_token = process.env.INDEXER_TOKEN_TESTNET;
            }

            algod_address = process.env.ALGOD_ADDR_TESTNET;
            algod_port = process.env.ALGOD_PORT_TESTNET;

            indexer_address = process.env.INDEXER_ADDR_TESTNET;
            indexer_port = process.env.INDEXER_PORT_TESTNET;

            break;
        default:
            break;
    }

    return {
        algod: {
            token: algod_token,
            address: algod_address,
            port: algod_port,
        },
        kmd: {
            token: kmd_token,
            address: kmd_address,
            port: kmd_port,
        },
        indexer: {
            token: indexer_token,
            address: indexer_address,
            port: indexer_port,
        }
    };
};

module.exports = {
    verifyCertificateAuthenticity
}