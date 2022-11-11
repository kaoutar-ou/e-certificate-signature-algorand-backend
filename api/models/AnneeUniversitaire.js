const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Etudiant = require('./Etudiant');
const Filiere = require('./Filiere');

const AnneeUniversitaire = sequelize.define('AnneeUniversitaire', {
    annee: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    isAdmis: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'annee_universitaires',
    timestamps: false,
});

Etudiant.hasMany(AnneeUniversitaire);

// Etudiant.belongsToMany(Filiere, { through: AnneeUniversitaire });
// Filiere.belongsToMany(Etudiant, { through: AnneeUniversitaire });

AnneeUniversitaire.belongsTo(Etudiant);
AnneeUniversitaire.belongsTo(Filiere);
Etudiant.hasMany(AnneeUniversitaire);

module.exports = AnneeUniversitaire;