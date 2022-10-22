const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Note = sequelize.define('Note', {
    note: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    commentaire: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'notes',
    timestamps: true,
});

module.exports = Note;