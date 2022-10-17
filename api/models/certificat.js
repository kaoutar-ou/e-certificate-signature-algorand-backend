const mongoose = require("mongoose");

const Certificat = mongoose.model(
    "Certificat",
    new mongoose.Schema({
        etudiant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Etudiant'
        },
        filiere: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Filiere",
        },
        fileName: String,
        txnHash: String,
    }, { timestamps: true }
    ));

module.exports = Certificat;

