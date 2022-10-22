const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AnneeUniversitaire = require('./AnneeUniversitaire');
const Certificat = require('./certificat');
const Note = require('./Note');
const User = require('./User');

const Etudiant = sequelize.define('Etudiant', {
    cne: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    code_apogee: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telephone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    date_naissance: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ville: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pays: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_inscription: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_sortie: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    visibility: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'etudiants',
    timestamps: true,
});

Etudiant.hasMany(Certificat);
Certificat.belongsTo(Etudiant);


Etudiant.hasMany(Note);
Note.belongsTo(Etudiant);

module.exports = Etudiant;