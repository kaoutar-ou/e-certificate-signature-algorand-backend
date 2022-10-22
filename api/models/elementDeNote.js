const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Etudiant = require('./Etudiant');
const Filiere = require('./Filiere');
const Note = require('./Note');

const ElementDeNote = sequelize.define('ElementDeNote', {
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'elements_de_notes',
    timestamps: true,
});

ElementDeNote.hasMany(Note);
Note.belongsTo(ElementDeNote);

module.exports = ElementDeNote;