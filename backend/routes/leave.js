const express = require("express");
const router = express.Router();
const LeaveApplication = require("../models/Leave");
const authMiddleware = require("../middleware/auth");

// Route to submit a leave application
router.post("/submit", authMiddleware, async (req, res) => {
    const { date, reason } = req.body;
    const teacherId = req.user.id; // Assuming the logged-in teacher's ID is available in req.user.id

    try {
        const newLeaveApplication = new LeaveApplication({
            teacherId,
            date,
            reason
        });
        await newLeaveApplication.save();
        res.status(201).json({ message: "Leave application submitted successfully" });
    } catch (error) {
        console.error("Error submitting leave application:", error);
        res.status(500).json({ message: "Failed to submit leave application" });
    }
});

// Route to fetch all leave applications for the logged-in teacher
router.get("/teacher", authMiddleware, async (req, res) => {
    const teacherId = req.user.id;

    try {
        const leaveApplications = await LeaveApplication.find({ teacherId }).sort({ createdAt: -1 });
        res.status(200).json(leaveApplications);
    } catch (error) {
        console.error("Error fetching leave applications:", error);
        res.status(500).json({ message: "Failed to fetch leave applications" });
    }
});

// Route for admin to approve/reject leave applications
router.put("/update/:id", authMiddleware, async (req, res) => {
    const { status } = req.body;
    const leaveId = req.params.id;

    try {
        const updatedLeave = await LeaveApplication.findByIdAndUpdate(
            leaveId,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedLeave) {
            return res.status(404).json({ message: "Leave application not found" });
        }

        res.status(200).json({ message: "Leave application updated successfully", leave: updatedLeave });
    } catch (error) {
        console.error("Error updating leave application:", error);
        res.status(500).json({ message: "Failed to update leave application" });
    }
});

router.get("/requests", authMiddleware, async (req, res) => {
    try {
        const leaveRequests = await LeaveApplication.find({ status: "Pending" })
            .populate("teacherId", "username") // Populate teacher details
            .sort({ createdAt: -1 });

        const formattedRequests = leaveRequests.map(request => ({
            _id: request._id,
            teacherName: request.teacherId.username,
            date: request.date,
            reason: request.reason
        }));

        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json({ message: "Failed to fetch leave requests" });
    }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
    const leaveId = req.params.id;
    const teacherId = req.user.id; // Ensure the teacher can only delete their own applications

    try {
        const leaveApplication = await LeaveApplication.findOneAndDelete({ _id: leaveId, teacherId });

        if (!leaveApplication) {
            return res.status(404).json({ message: "Leave application not found or not authorized to delete." });
        }

        res.status(200).json({ message: "Leave application deleted successfully." });
    } catch (error) {
        console.error("Error deleting leave application:", error);
        res.status(500).json({ message: "Failed to delete leave application." });
    }
});

module.exports = router;