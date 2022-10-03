const mongoose = require("mongoose");

const Semestre = mongoose.model(
    "Semestre",
    new mongoose.Schema({
        num: String,
        filiere: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Filiere'
        },
        modules: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Module'
            }],
    }, { timestamps: true }));

module.exports = Semestre;