const mongoose = require("mongoose");

const Etudiant = mongoose.model(
    "Etudiant",
    new mongoose.Schema({
        cne: String,
        code_apogee: String,
        address: String,
        avatar:String,
        date_naissance: String,
        telephone: String,
        ville: String,
        pays: String,
        date_inscription: String,
        date_sort: String,
        // valide: {
        //     type: Boolean,
        //     default: false
        // },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        filiere: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Filiere'
        },
        certificats: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Certificat'
            }
        ],
        annee_universitaires: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'AnneeUniversitaire'
            }
        ],
    }, { timestamps: true }
    ));

module.exports = Etudiant;

