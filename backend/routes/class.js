const express = require("express");
const Class = require("../models/Class");
const authMiddleware = require("../middleware/auth"); // Middleware to verify JWT

const router = express.Router();

// Add a new class (Only admin can add)
router.post("/add", authMiddleware, async (req, res) => {
    const { name } = req.body;
    const adminId = req.user.id; // Extracted from JWT token
    if (!name) {
        return res.status(400).json({ message: "Class name is required" });
    }

    try {
        const newClass = new Class({ name, admin: adminId });
        await newClass.save();
        res.status(201).json({ message: "Class added successfully", class: newClass });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: "Class deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// Fetch classes for the logged-in admin
router.get("/", authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find({ admin: req.user.id }); // Only fetch classes created by this admin
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;