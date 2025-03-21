const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/auth")

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET||"AARYAA";

router.post("/login", async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: "Missing fields" });
    }
    try {
        let user;
        if (role === "admin") user = await Admin.findOne({ username });
        else if (role === "teacher") user = await Teacher.findOne({ username });
        else if (role === "student") user = await Student.findOne({ username });
        else return res.status(400).json({ message: "Invalid role" });
        
        if (!user) return res.status(400).json({ message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role, username }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, role });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/signup", async (req, res) => {
    const { username, password, role } = req.body;

    try {
        let Model = Admin;
        if(role != "admin") return res.status(400).json({ message: "Invalid role" });
        // Check if user already exists
        const existingUser = await Model.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        // Hash the password;
        const newUser = new Model({ username, password});
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


router.delete("/delete",authMiddleware,async (req, res) => {
    try {
        const adminId = req.user.id;
        await Admin.findByIdAndDelete(adminId);
        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/change-password",authMiddleware, async (req,res)=>{
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "New password is required" });
        }
        console.log(password)
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = req.user.role;
        let Model;
        if (role === "admin") Model = Admin;
        else if (role === "teacher") Model = Teacher;
        else if (role === "student") Model = Student;
        else return res.status(400).json({ message: "Invalid role" });
        const updateResult = await Model.updateOne(
            { _id: req.user.id}, // Find admin by ID (extracted from token)
            { $set: { password: hashedPassword } } // Update password
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ message: "Password change failed" });
        }

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;