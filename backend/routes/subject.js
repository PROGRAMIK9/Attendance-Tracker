const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth"); 
const Subject = require("../models/Subject");
const Student = require("../models/Student");

// ✅ Add a new subject with teacher
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { name, classId, teacherId } = req.body;
        const adminId = req.user.id;
        if (!name || !classId || !teacherId) {
            return res.status(400).json({ message: "Subject name, class ID, and teacher ID are required" });
        }

        const newSubject = new Subject({ name, classId, teacherId, admin: adminId });
        await newSubject.save();
        res.status(201).json({ message: "Subject added successfully", subject: newSubject });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Fetch all subjects with class & teacher info
router.get("/", authMiddleware, async (req, res) => {
    try {
        const subjects = await Subject.find({ admin: req.user.id })
            .populate("classId", "name")
            .populate("teacherId", "username");
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
});


router.get("/teachers", authMiddleware, async (req, res) => {
    try {
        const subjects = await Subject.find({ teacherId: req.user.id })
            .populate("classId", "name")
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
});

router.get("/students", authMiddleware, async (req, res) => {
    try {
        const student = await Student.findOne({ _id: req.user.id })
        const subjects = await Subject.find({ classId: student.classId })
            .populate("classId", "name")
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
});

router.get("/subjects", authMiddleware, async (req, res) => {
    try {
        const teacherId=req.user.id;
        const {classId} = req.query;
        if (!teacherId || !classId) {
            return res.status(400).json({ message: "Teacher ID and Class ID are required" });
        }
        const subjects = await Subject.find({ teacherId, classId }).populate("classId", "name");
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
});


router.get("/classes", authMiddleware, async (req, res) => {
    try {
        const teacherId = req.user.id;
        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required" });
        }
        const classes = await Subject.find({ teacherId }).populate("classId", "name");
        const uniqueClasses = [...new Map(classes.map(item => [item.classId._id.toString(), item.classId])).values()];
        res.status(200).json(uniqueClasses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching classes", error: error.message });
    }
});


// ✅ Delete a subject
router.delete("/:id", async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;