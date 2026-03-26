const express = require("express");
const router = express.Router();
const User = require("../models/user"); // make sure file name is 'user.js'
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ======================
// 🟢 REGISTER USER
// ======================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Save to DB
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ======================
// 🔵 LOGIN USER
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 3. Create JWT token
    const token = jwt.sign(
      { id: user._id },
      "secretkey", // you can later move this to .env
      { expiresIn: "1d" }
    );

    // 4. Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;