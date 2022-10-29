const utils = require("../utils/blockchain");
const algosdk = require("algosdk");
const path = require("path");
const fs = require("fs");

const getAlgodClient = async (req, res) => {

    // let network = req.params.network ? req.params.network.toUpperCase() : "TESTNET";
    let network = req.body.network ? req.body.network.toUpperCase() : "TESTNET";
    let sender = req.body.sender;

    if (sender === process.env.ADDR_CREATOR_TESTNET) {
        const algodClient = utils.getAlgodClient(network);
        console.log("🚀 ~ file: blockchain.controller.js ~ line 14 ~ getAlgodClient ~ network", network)
        console.log("🚀 ~ file: blockchain.controller.js ~ line 9 ~ getAlgodClient ~ algodClient", algodClient)

        const filePath = path.join(process.cwd(), "artifacts", "stateless_sc.teal");
        const data = fs.readFileSync(filePath);
        const compiledProgram = await algodClient.compile(data).do();

        // Create logic signature for sender account
        const programBytes = new Uint8Array(Buffer.from(compiledProgram.result, "base64"));
        const lsig = new algosdk.LogicSigAccount(programBytes);
        sender = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_CREATOR_TESTNET);
        console.log("sender")
        console.log(sender)
        lsig.sign(sender.sk);
        console.log("🚀 ~ file: blockchain.controller.js ~ line 27 ~ getAlgodClient ~ lsig", lsig)

        let params = await algodClient.getTransactionParams().do();


        console.log(params);
        // assetAmount = 1;
    
        // params.fee = 1000;
        // params.flatFee = true;
        // console.log(params);
    
        // let note = undefined;
        // // let note = certificate.User.nom + " certificate";
    
        // let address = sender;
    
        // let defaultFrozen = false;
    
        // let decimals = 0;
    
        // let total = 1;
    
        // let unitName = "Certif";
        
        // let assetName = "Certificate";
    
        // let assetURL = "http://certificate.ma";
    
        // let assetMetadataHash = new Uint8Array();
        // console.log(assetMetadataHash)
    
        // let manager = undefined;
    
        // let reserve = undefined;
        
        // let freeze = undefined;
        
        // let clawback = undefined;
    
        // let signer = algodClientInfo.lsig;
        // console.log("Signer" + signer)
    
        console.log("lsig")
        console.log(lsig)
        // let txn = algosdk.makeAssetCreateTxnWithSuggestedParams(lsig.address(), note,
        //     total, decimals, defaultFrozen, manager, reserve, freeze,
        //     clawback, unitName, assetName, assetURL, assetMetadataHash, params);
    


        // console.log(txn)





        // console.log(params);
        // return res.status(200).send({txn});
        return res.status(200).send({params: params, lsig: lsig.address()});
        // return res.status(200).send(algodClient);
    }
    else {
        return res.status(401).send({message: "Unauthorized"});
    }
}

const sendRawTransaction = async (req, res) => {
    let network = req.params.network ? req.params.network.toUpperCase() : "TESTNET";
    let binarySignedTx = req.body.binarySignedTx;
    console.log("🚀 ~ file: blockchain.controller.js ~ line 21 ~ sendRawTransaction ~ binarySignedTx", binarySignedTx)
    const algodClient = utils.getAlgodClient(network);
    
    let byteArrayTxn = Uint8Array.from(Buffer.from(binarySignedTx, 'base64'));
    let response = await algodClient 
                .sendRawTransaction(byteArrayTxn)
                .do();
    return res.status(200).send({message: "Sent Successfully", data: response});
}

module.exports = {
    getAlgodClient,
    sendRawTransaction
}