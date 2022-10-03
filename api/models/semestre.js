const mongoose = require("mongoose");

const Semestre = mongoose.model(
    "Semestre",
    new mongoose.Schema({
        num: String,
    }, { timestamps: true }));

module.exports = Semestre;