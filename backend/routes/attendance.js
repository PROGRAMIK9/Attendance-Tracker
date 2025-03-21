const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/auth");
const Subject = require('../models/Subject');

// ✅ Fetch attendance for a class, subject, and month
router.get("/", async (req, res) => {
    try {
        const { classId, subjectId, month } = req.query;
        if (!classId || !subjectId || !month) {
            return res.status(400).json({ message: "Class ID, Subject ID, and Month are required" });
        }
        const students = await Student.find({ classId }).select("_id username");
        // Fetch existing attendance records
        const attendanceRecords = await Attendance.find({ subject: subjectId, month })
            .lean()
            .select("student date status");
        // Organize attendance data
        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            if (!attendanceMap[record.student]) {
                attendanceMap[record.student] = {};
            }
            const day = new Date(record.date).getDate();
            attendanceMap[record.student][day] = record.status;
        });
        // Get number of days in the selected month
        const year = new Date().getFullYear();
        const daysInMonth = new Date(year, month, 0).getDate();
        // Format response
        const studentData = students.map(student => {
            const attendance = {};
            for (let i = 1; i <= daysInMonth; i++) {
                attendance[i] = attendanceMap[student._id]?.[i] || "Absent"; // Default to Absent
            }
            return {
                id: student._id,
                name: student.username,
                attendance
            };
        });
        res.status(200).json(studentData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching attendance", error: error.message });
    }
});


router.get("/student", authMiddleware, async (req, res) => {
    try {
        const {subjectId, month } = req.query;
        const studentId = req.user.id;

        if (!subjectId || !month) {
            return res.status(400).json({ message: "Subject ID, and Month are required" });
        }

        const attendanceRecords = await Attendance.find({
            student:studentId,
            subject:subjectId,
            month
        }).populate("student", "username");
        console.log(attendanceRecords);
        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: "No attendance records found" });
        }
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: "Error fetching attendance records", error: error.message });
    }
});

// ✅ Mark attendance for students
router.post("/", async (req, res) => {
    try {
        const { attendanceData, subjectId, month } = req.body;
        if (!attendanceData || !subjectId || !month) {
            return res.status(400).json({ message: "Attendance data, Subject ID, and Month are required" });
        }
        const year = new Date().getFullYear();
        for (const entry of attendanceData) {
            const { studentId, day, status } = entry;
            const date = new Date(year, month - 1, day); // Ensure correct date format
            // Find if the attendance already exists
            const existingRecord = await Attendance.findOne({ student: studentId, subject: subjectId, date });
            if (existingRecord) {
                // Update existing record
                existingRecord.status = status;
                await existingRecord.save();
            } else {
                // Create new attendance record
                await Attendance.create({ student: studentId, subject: subjectId, date, month, status });
            }
        }
        res.status(200).json({ message: "Attendance updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating attendance", error: error.message });
    }
});

router.get("/report", authMiddleware, async (req, res) => {
    try {
        const { classId, subjectId, month } = req.query;

        if (!classId || !subjectId || !month) {
            return res.status(400).json({ message: "Class ID, Subject ID, and Month are required" });
        }

        const students = await Student.find({ classId }).select("_id username");
        const attendanceRecords = await Attendance.find({ subject: subjectId, month })
            .lean()
            .select("student date status");

        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            if (!attendanceMap[record.student]) {
                attendanceMap[record.student] = { present: 0, total: 0 };
            }
            const day = new Date(record.date).getDate();
            attendanceMap[record.student].total += 1;
            if (record.status === "Present") {
                attendanceMap[record.student].present += 1;
            }
        });

        const year = new Date().getFullYear();
        const daysInMonth = new Date(year, month, 0).getDate();

        const reportData = students.map(student => {
            const attendance = attendanceMap[student._id] || { present: 0, total: daysInMonth };
            const percentage = (attendance.present / daysInMonth) * 100; // Use daysInMonth for total
            return {
                id: student._id,
                name: student.username,
                percentage: percentage.toFixed(2) // Format to 2 decimal places
            };
        });

        res.status(200).json(reportData);
    } catch (error) {
        res.status(500).json({ message: "Error generating report", error: error.message });
    }
});

// Route to fetch monthly report for all subjects
router.get('/student/monthly', authMiddleware, async (req, res) => {
    const { month, classId } = req.query;
    const studentId = req.user.id;
    if (!classId || !month) {
        return res.status(400).json({ message: "Class ID, Subject ID, and Month are required" });
    }
    try {
        const subjects = await Subject.find({classId});
        const reportData = [];

        for (const subject of subjects) {
            const attendanceRecords = await Attendance.find({
                student: studentId,
                subject: subject._id,
                month
            });

            const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
            const presentDays = attendanceRecords.filter(record => record.status === "Present").length;
            const attendancePercentage = ((presentDays / daysInMonth) * 100).toFixed(2);

            reportData.push({
                subjectName: subject.name,
                attendancePercentage
            });
        }

        res.json(reportData);
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ error: 'Failed to fetch monthly report' });
    }
});

module.exports = router;
