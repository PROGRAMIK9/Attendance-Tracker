const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Subject = require("../models/Subject");
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

router.get("/teacher", authMiddleware, async (req, res) => {
    const teacherId = req.user.id; // Assuming the logged-in teacher's ID is available in `req.user.id`

    try {
        // Find all subjects assigned to the teacher
        const subjects = await Subject.find({ teacherId }).select("_id name");

        // Extract subject IDs
        const subjectIds = subjects.map(subject => subject._id);

        // Fetch feedback for the teacher's subjects
        const feedbacks = await Feedback.find({ subjectId: { $in: subjectIds } })
            .populate("subjectId", "name") // Populate subject details
            .select("-studentId"); // Exclude studentId to keep it anonymous
        console.log(feedbacks);
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Failed to fetch feedback" });
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