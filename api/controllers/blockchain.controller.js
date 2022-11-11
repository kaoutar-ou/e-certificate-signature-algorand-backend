const utils = require("../utils/blockchain");
const algosdk = require("algosdk");
const path = require("path");
const fs = require("fs");
const { hashDocument } = require("../../process");
const { decryptFilename, updateCertificat } = require("./process.controller");
const Certificat = require("../models/Certificat");
const Etudiant = require("../models/Etudiant");
const User = require("../models/User");
const { deleteFile } = require("../utils/upload");


const getAlgodClient = async (req, res) => {

    let network = req.body.network ? req.body.network.toUpperCase() : "TESTNET";
    let sender = req.body.sender;
    let certificateId = req.body.certificateId;
    console.log("🚀 ~ file: blockchain.controller.js ~ line 14 ~ getAlgodClient ~ certificateId", certificateId)
    

    const certificate = await Certificat.findByPk(certificateId, {
        include: [
            {
                model: Etudiant,
                as: "Etudiant",
                include: [
                    {
                        model: User,
                        as: "User",
                    },
                ],
            }
        ]
    });
    
    if(certificate != null && certificate != undefined){
        const folderName = certificate.Etudiant.cne.toLowerCase();
        const fileName = decryptFilename(certificate.fileName);
        console.log("🚀 ~ file: blockchain.controller.js ~ line 16 ~ getAlgodClient ~ fileName", fileName)
        
        if (sender === process.env.ADDR_CREATOR_TESTNET) {
            try {
                const algodClient = utils.getAlgodClient(network);
                console.log("🚀 ~ file: blockchain.controller.js ~ line 14 ~ getAlgodClient ~ network", network)
                console.log("🚀 ~ file: blockchain.controller.js ~ line 9 ~ getAlgodClient ~ algodClient", algodClient)

                const filePath = path.join(process.cwd(), "artifacts", "stateless_sc.teal");
                const data = fs.readFileSync(filePath);
                const compiledProgram = await algodClient.compile(data).do();

                const programBytes = new Uint8Array(Buffer.from(compiledProgram.result, "base64"));
                const lsig = new algosdk.LogicSigAccount(programBytes);
                sender = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_CREATOR_TESTNET);
                console.log("sender")
                console.log(sender)
                lsig.sign(sender.sk);
                console.log("🚀 ~ file: blockchain.controller.js ~ line 27 ~ getAlgodClient ~ lsig", lsig)

                let params = await algodClient.getTransactionParams().do();


                console.log(params);

            
                console.log("lsig");
                console.log(lsig);

                assetAmount =1;

                params.fee = 1000;
                params.flatFee = true;
                console.log(params);

                let note = undefined;

                let address = sender;

                let defaultFrozen = false;

                let decimals = 0;

                let total = 1;

                let unitName = "E-Certif";
                
                let assetName = "E-Certificate";

                let assetURL = "https://e-certificate.vr4.ma";

                console.log("_____________--------------___________" + assetURL);

                let assetMetadataHash = await hashDocument(path.join(process.cwd(), 'uploads', 'certificates', folderName, fileName+".pdf"));
                console.log("🚀 ~ file: blockchain.controller.js ~ line 92 ~ getAlgodClient ~ assetMetadataHash")
                console.log(assetMetadataHash);
                

                let manager = undefined;

                let reserve = undefined;
                
                let freeze = undefined;
                
                let clawback = undefined;

                let txn = algosdk.makeAssetCreateTxnWithSuggestedParams(lsig.address(), note,
                    total, decimals, defaultFrozen, manager, reserve, freeze,
                    clawback, unitName, assetName, assetURL, assetMetadataHash, params);

                let binaryTx = txn.toByte();

                console.log("binaryTx");
                console.log(binaryTx);
                return res.status(200).send({params: params, lsig: binaryTx});
            } catch (error) {
                console.log(error);
                return res.status(500).send({message: "Internal Server Error"});
            }
        }
        else {
            return res.status(401).send({message: "Unauthorized"});
        }
    } else {
        return res.status(404).send({message: "Certificate not found"});
    }
}

const sendRawTransaction = async (req, res) => {
    let network = req.params.network ? req.params.network.toUpperCase() : "TESTNET";
    let binarySignedTx = req.body.binarySignedTx;
    let certificateId = req.body.certificateId;
    console.log("🚀 ~ file: blockchain.controller.js ~ line 133 ~ sendRawTransaction ~ binarySignedTx", binarySignedTx)
    try {
        const algodClient = utils.getAlgodClient(network);
        
        let byteArrayTxn = Uint8Array.from(Buffer.from(binarySignedTx, 'base64'));
        let response = await algodClient 
                    .sendRawTransaction(byteArrayTxn)
                    .do();

        let updated = await updateCertificat({certificateId, txnId: response.txId});
        if(updated){
            return res.status(200).send({message: "Certificate Signed Successfully", data: response});
        } else {
            return res.status(500).send({message: "Internal Server Error"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

const verifyDocumentHash = async (data) => {
    let network = data.network ? data.network.toUpperCase() : "TESTNET";
    let documentHash = data.documentHash ? data.documentHash : null;
    let txnHash = data.txnHash ? data.txnHash : null;
    console.log("🚀 ~ file: blockchain.controller.js ~ line 156 ~ verifyDocumentHash ~ txnHash", txnHash)

    if(documentHash != null && txnHash != null){
        try {
            const indexerClient = utils.getIndexerClient(network);

            let response = await indexerClient.lookupTransactionByID(txnHash).do();

            response = response.transaction['created-asset-index'];
            response = await indexerClient.lookupAssetByID(response).do();
            response = response.asset.params['metadata-hash'];

            // let assetMetadataHash = await hashDocument(path.join(process.cwd(), 'uploads', 'certificates', 'mouzafir-abdelhadi', 'mouzafir-abdelhadi_irisi_2022-2023'+".pdf"));
            // let hash = Buffer.from(assetMetadataHash).toString('base64');
            // console.log(hash === response);

            documentHash = Buffer.from(documentHash).toString('base64');
            console.log("🚀 ~ file: blockchain.controller.js ~ line 172 ~ verifyDocumentHash ~ documentHash", documentHash)
            return documentHash === response;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    else {
        return false;
    }
}

const verifyCertificateAuthenticity = async (req, res) => {
    let certificateId = req.body.certificateId;
    console.log(certificateId);
    let certificate = null
    certificate = await Certificat.findByPk(certificateId, {
        include: [
            {
                model: Etudiant,
                as: "Etudiant",
            }
        ]}
    );
    if(certificate){
        const folderName = certificate.Etudiant.cne
        const fileName = decryptFilename(certificate.fileName);
        let documentHash = null;
        let txnHash = null;
        documentHash = await hashDocument(path.join(process.cwd(), 'uploads', 'certificates', folderName, fileName+".pdf"));
        txnHash = certificate.txnHash;
        console.log("🚀 ~ file: blockchain.controller.js ~ line 202 ~ verifyCertificateAuthenticity ~ txnHash", txnHash)
        
        if(documentHash) {
            let data = {
                documentHash,
                txnHash
            }
            let response = await verifyDocumentHash(data);
            console.log("🚀 ~ file: blockchain.controller.js ~ line 210 ~ verifyCertificateAuthenticity ~ response", response)
            if(response == true){
                return res.status(200).send({message: "Certificate Verified Successfully", verified: true});
            } else {
                return res.status(200).send({message: "Certifate Verification Failed", verified: false});
            }
        } else {
            return res.status(500).send({message: "Internal Server Error"});
        }
    } else {
        return res.status(500).send({message: "Internal Server Error"})
    }
}

const verifyAttachedCertificate = async (req, res) => {
    console.log("hi")
    if(req.files?.file == null || req.files?.file == undefined){
        return res.status(400).send({message: "No file attached"});
    }
    if(req.files.file.mimetype == 'application/pdf') {
        let attachedPath = path.join(process.cwd(), 'uploads', new Date().getTime() + ".pdf");
        console.log("🚀 ~ file: blockchain.controller.js ~ line 232 ~ verifyAttachedCertificate ~ attachedPath", attachedPath)
        if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
            fs.mkdir(path.join(process.cwd(), 'uploads'), error => error ? console.log(error) : console.log('Directory created') ) ;
        }
        req.files.file.mv(attachedPath, async (err) => {
            if (err) {
                return res.status(500).send(err);
            }})

        let certificateId = req.body.certificateId ? req.body.certificateId : null;
        console.log(certificateId);

        if(certificateId != null){
            let certificate = null
            certificate = await Certificat.findByPk(certificateId, {
                include: [
                    {
                        model: Etudiant,
                        as: "Etudiant",
                    }
                ]}
            );
            if(certificate){
                
                let documentHash = null;
                let txnHash = null;

                documentHash = await hashDocument(attachedPath);
                txnHash = certificate.txnHash;

                if(documentHash) {
                    let data = {
                        documentHash,
                        txnHash
                    }
                    let response = await verifyDocumentHash(data);
                    deleteFile(attachedPath);
                    if(response == true){
                        return res.status(200).send({message: "Certificate Verified Successfully", verified: true});
                    } else {
                        return res.status(200).send({message: "Certifate Verification Failed", verified: false});
                    }
                } else {
                    return res.status(500).send({message: "Internal Server Error"});
                }
            } else {
                deleteFile(attachedPath);
                return res.status(500).send({message: "Certificate not found"})
            }
        } else {
            deleteFile(attachedPath);
            return res.status(400).send({message: "Certificate not found"});
        }
            
    } else {
        return res.status(400).send({ message: "Please upload a file!" });
    }
    
}

module.exports = {
    getAlgodClient,
    sendRawTransaction,
    verifyDocumentHash,
    verifyCertificateAuthenticity,
    verifyAttachedCertificate
}