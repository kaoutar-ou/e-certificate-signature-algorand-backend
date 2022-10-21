const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || "default-certif-db", 
    process.env.USER || "postgres", 
    process.env.PASSWORD || "root", 
    {
        host: process.env.HOST || "localhost",
        dialect: process.env.DIALECT || "postgres",
        logging: false,
    }
  );

module.exports = sequelize;