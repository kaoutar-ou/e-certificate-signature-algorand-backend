const mongoose = require("mongoose");

const Filiere = mongoose.model(
    "Filiere",
    new mongoose.Schema({
        nom: String,
        abbr: {
            type: String,
            unique: true
        },
        description: String,
        logo: String,
        date_creation: String,
        site_web: String,
        duree: Number,
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
        semestres: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Semestre'
            }],


    }, { timestamps: true }));

module.exports = Filiere;

