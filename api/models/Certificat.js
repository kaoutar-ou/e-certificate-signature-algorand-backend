const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Etudiant = require('./Etudiant');
const Filiere = require('./Filiere');

const Certificat = sequelize.define('Certificat', {
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    txnHash: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
}, {
    tableName: 'certificats',
    timestamps: true,
});

Certificat.belongsTo(Filiere);


module.exports = Certificat;