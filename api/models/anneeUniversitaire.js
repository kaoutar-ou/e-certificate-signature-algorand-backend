const mongoose = require("mongoose");

const AnneeUniversitaire = mongoose.model(
    "AnneeUniversitaire",
    new mongoose.Schema({
        annee: String,
        etudiant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Etudiant'
        },
        filiere: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Filiere",
        },
        notes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Note'
            }
        ],
        isAdmis: {
            type: Boolean,
            default: false
        },
    }
    , { timestamps: true }
    ));

module.exports = AnneeUniversitaire;