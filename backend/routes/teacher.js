const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth"); 
const Teacher = require("../models/Teacher");

// Default password for new teachers
const DEFAULT_TEACHER_PASSWORD = "teacher123"; 

// ✅ Add a new teacher
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { username } = req.body;
        const adminId = req.user.id;
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ username });
        if (existingTeacher) {
            return res.status(400).json({ message: "Teacher already exists" });
        }

        const newTeacher = new Teacher({
            username,
            password: DEFAULT_TEACHER_PASSWORD,
            admin:adminId
        });

        await newTeacher.save();
        res.status(201).json({ message: "Teacher created successfully", teacher: newTeacher });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Fetch all teachers
router.get("/", authMiddleware, async (req, res) => {
    try {
        const teachers = await Teacher.find({ admin: req.user.id}, { password: 0 }); // Hide passwords
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Delete a teacher
router.delete("/:id", async (req, res) => {
    try {
        const teacherId = req.params.id;
        const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);
        
        if (!deletedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
