"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME || "archershub",
    process.env.DB_USER || "archers",
    process.env.DB_PASSWORD || "abc1234",
    {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        dialect: "mysql",
        logging: false
    }
);

module.exports = sequelize;
