const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || "default-certif-db", 
    process.env.USER || "root", 
    process.env.PASSWORD || "", 
    {
        host: process.env.HOST || "localhost",
        dialect: process.env.DIALECT || "mysql",
        logging: false,
    }
  );

module.exports = sequelize;