const mongoose = require("mongoose");

const Filiere = mongoose.model(
    "Filiere",
    new mongoose.Schema({
        nom: String,
        description: String,
        logo: String,
        date_creation: String,
        site_web: String,
        duree: String,
        diplome: String,
        etablissement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Etablissement'
        },
        etudiants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Etudiant'
            }],
        modules: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Module'
            }],


    }, { timestamps: true }));

module.exports = Filiere;

