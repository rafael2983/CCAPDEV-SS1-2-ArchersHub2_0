"use strict";

const User = require("../models/user");

// Plain-text comparison for this phase (no hashing yet).
// When hashing is added later, only this function needs to change.
function passwordMatches(plain, stored) {
    return plain === stored;
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user || !passwordMatches(password, user.password_hash)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.account_status === "Disabled") {
            return res.status(403).json({ message: "Account is disabled" });
        }

        res.json({
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { login };
