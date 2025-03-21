const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    date: { type: Date, required: true, default: Date.now },
    month: { type: String, required: true },
    status: { type: String, enum: ["Present", "Absent"], required: true }
});

module.exports = mongoose.model("Attendance", AttendanceSchema);