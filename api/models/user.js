const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AnneeUniversitaire = require('./AnneeUniversitaire');
const Etudiant = require('./Etudiant');

const User = sequelize.define('User', {
    username: {
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
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cin: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    mac: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'users',
    timestamps: true,
});

Etudiant.belongsTo(User);

module.exports = User;