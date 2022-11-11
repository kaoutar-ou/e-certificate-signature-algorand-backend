// const sequelize = require("../../config/db");
// const { DataTypes } = require('sequelize');

// const Role = require("./role");
// const User = require("./User");

// const UserRole = sequelize.define('UserRole', {
//     // userId: {
//     //     type: DataTypes.INTEGER,
//     //     allowNull: false,
//     //     references: {
//     //         model: User,
//     //         key: 'id'
//     //     }
//     // },
//     // roleId: {
//     //     type: DataTypes.INTEGER,
//     //     allowNull: false,
//     //     references: {
//     //         model: Role,
//     //         key: 'id'
//     //     }
//     // },
// }, {
//     tableName: 'user_roles',
//     timestamps: false,
// });

// User.belongsToMany(Role, { through: UserRole });
// Role.belongsToMany(User, { through: UserRole });

// // UserRole.hasOne(User, { foreignKey: 'userId' });
// // UserRole.hasOne(Role, { foreignKey: 'roleId' });

// module.exports = UserRole;