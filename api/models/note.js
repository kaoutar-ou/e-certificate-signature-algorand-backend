const mongoose = require("mongoose");

const Note = mongoose.model(
    "Note",
    new mongoose.Schema({
        note: Number,
        commentaire: String,
        etudiant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Etudiant'
        },
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module'
        },
        annee_universitaire: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AnneeUniversitaire'
        }
    }, { timestamps: true }));

module.exports = Note;