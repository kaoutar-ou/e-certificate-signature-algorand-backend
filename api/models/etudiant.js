const mongoose = require("mongoose");

const Etudiant = mongoose.model(
    "Etudiant",
    new mongoose.Schema({
        address: String,
        date_naissance: String,
        telephone: String,
        ville: String,
        pays: String,
        date_inscription: String,
        date_sort: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        filiere: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Filiere'
        },
        annee_universitaires: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'AnneeUniversitaire'
            }
        ],
        notes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Note'
            }]
    }
    ));

module.exports = Etudiant;

