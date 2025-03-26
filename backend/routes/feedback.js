const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/auth");

// Route to submit feedback
router.post("/submit", authMiddleware, async (req, res) => {
    const { subjectId, feedback } = req.body;
    const studentId = req.user.id;

    try {
        const newFeedback = new Feedback({
            studentId,
            subjectId,
            feedback
        });
        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: "Failed to submit feedback" });
    }
});

// Route to get all feedback (for teachers)
router.get("/all", authMiddleware, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate("teacherId", "name").select("-userId"); // Exclude userId to keep it anonymous
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Failed to fetch feedback" });
    }
});

module.exports = router;