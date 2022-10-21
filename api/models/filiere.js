const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Etablissement = require('./Etablissement');

const Filiere = sequelize.define('Filiere', {
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
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_creation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    duree: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    diplome: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'filieres',
    timestamps: true,
});

Filiere.belongsTo(Etablissement);

Etablissement.hasMany(Filiere);


module.exports = Filiere;