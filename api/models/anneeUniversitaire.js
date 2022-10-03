const mongoose = require("mongoose");

const AnneeUniversitaire = mongoose.model(
    "AnneeUniversitaire",
    new mongoose.Schema({
        annee: String,
        etudiant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Etudiant'
        },
        isAdmis: Boolean,
    }
    ));

module.exports = AnneeUniversitaire;