"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
    "User",
    {
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM("Student", "Teacher", "APO", "Provost", "Admin"),
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        nickname: DataTypes.STRING(100),
        address: DataTypes.STRING(255),
        contact_number: DataTypes.STRING(30),
        profile_picture: DataTypes.STRING(255),
        account_status: {
            type: DataTypes.ENUM("Active", "Disabled"),
            allowNull: false,
            defaultValue: "Active"
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "users",
        timestamps: false
    }
);

module.exports = User;
