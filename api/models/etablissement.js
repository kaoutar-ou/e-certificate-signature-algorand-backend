const mongoose = require("mongoose");

const Etablissement = mongoose.model(
    "Etablissement",
    new mongoose.Schema({
        nom: String,
        abbr: String,
        description: String,
        email: {
            type: "string",
            unique: true,
            match:
                /^[a-zA-Z0-9_.+]*[a-zA-Z][a-zA-Z0-9_.+]*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        },
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
    }, { timestamps: true }
    ));

module.exports = Etablissement;