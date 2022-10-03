const mongoose = require("mongoose");

const Module = mongoose.model(
    "Module",
    new mongoose.Schema({
        nom: String,
        description: String,
        semestre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semestre'
        },
    }, { timestamps: true })
);

module.exports = Module;