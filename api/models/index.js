const models = {};
models.user = require("./user");
models.role = require("./role");
models.etudiant = require("./etudiant");
models.filiere = require("./filiere");
models.anneeUniversitaire = require("./anneeUniversitaire");
models.module = require("./module");
models.semestre = require("./semestre");
models.note = require("./note");
models.etablissement = require("./etablissement");
models.university = require("./university");
models.certificat = require("./certificat");


models.ROLES = ["etudiant", "super_admin", "admin"];

module.exports = models;