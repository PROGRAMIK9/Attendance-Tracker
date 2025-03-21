const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const authMiddleware = require("../middleware/auth"); 

// Default password for new teachers
const DEFAULT_TEACHER_PASSWORD = "student123"; 

// ✅ Add a new teacher
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { username,classId} = req.body;
        const adminId = req.user.id;
        if (!username || !classId) {
            return res.status(400).json({ message: "Username, Class is required" });
        }

        // Check if teacher already exists
        const existingStudent = await Student.findOne({ username, classId });
        if (existingStudent) {
            return res.status(400).json({ message: "Student already exists" });
        }

        const newStudent = new Student({
            username,
            password: DEFAULT_TEACHER_PASSWORD,
            admin:adminId,
            classId:classId
        });

        await newStudent.save();
        res.status(201).json({ message: "Student created successfully", student: newStudent });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Fetch all teachers
router.get("/", authMiddleware, async (req, res) => {
    try {
        const student = await Student.find({admin:req.user.id}, { password: 0 })
            .populate("classId","name"); // Hide passwords
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/class", authMiddleware, async (req, res) => {
    try {
        const student = await Student.findOne({_id:req.user.id})
        .populate("classId","name");
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Delete a teacher
router.delete("/:id", async (req, res) => {
    try {
        const studentId = req.params.id;
        const deletedStudent = await Student.findByIdAndDelete(studentId);
        
        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
