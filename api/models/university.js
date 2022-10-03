const mongoose = require("mongoose");

const University = mongoose.model(
    "University",
    new mongoose.Schema({
        nom: String,
        abbr: String,
        email: {
            type: "string",
            unique: true,
            match:
                /^[a-zA-Z0-9_.+]*[a-zA-Z][a-zA-Z0-9_.+]*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        },
        adresse: String,
        telephone: String,
        code_postal: String,
        ville: String,
        pays: String,
        site_web: String,
        logo: String,
        description: String,
        date_creation: String,
        etablissements: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Etablissement'
            }
        ]

    }, { timestamps: true }));

module.exports = University;


