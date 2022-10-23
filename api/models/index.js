let models = {}
models.user = require("./User");
models.role = require("./Role");
models.etudiant = require("./Etudiant");
models.filiere = require("./Filiere");
models.anneeUniversitaire = require("./AnneeUniversitaire");
models.etablissement = require("./Etablissement");
models.university = require("./University");
models.certificat = require("./Certificat");

module.exports = models;
