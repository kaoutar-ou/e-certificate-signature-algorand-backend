const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('./User');

const Role = sequelize.define('Role', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'roles',
    timestamps: false,
});

User.belongsToMany(Role, { through: "user_roles" });


module.exports = Role;