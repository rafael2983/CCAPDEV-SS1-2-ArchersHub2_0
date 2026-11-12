"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });


const express = require("express");
const cors = require("cors");
const sequelize = require("./config/sequelize");
const User = require("./models/user");
const authRoutes = require("./routes/auth");


const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

async function start() {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connected to MySQL");
        // test
        // const users = await User.findAll();
        // console.log("Users found:", users.length);
        
    } catch (err) {
        console.error("Sequelize connection failed:", err.message);
    }

    app.listen(PORT, () => {
        console.log(`ArchersHub API running at http://localhost:${PORT}`);
    });
}

start();
