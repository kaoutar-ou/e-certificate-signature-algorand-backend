const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Filiere = require('./Filiere');
const University = require('./University');

const Etablissement = sequelize.define('Etablissement', {
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    abbr: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    adresse: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telephone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code_postal: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ville: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pays: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    site_web: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    date_creation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'etablissements',
    timestamps: true,
});


Etablissement.belongsTo(University);

University.hasMany(Etablissement);

module.exports = Etablissement;