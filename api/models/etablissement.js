const mongoose = require("mongoose");

const Etablissement = mongoose.model(
    "Etablissement",
    new mongoose.Schema({
        nom: String,
        description: String,
        logo: String,
        date_creation: String,
        adresse: String,
        telephone: String,
        code_postal: String,
        ville: String,
        site_web: String,
        universite: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'University'
        },
        filieres: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Filiere'
            }]
    }
    ));

module.exports = Etablissement;