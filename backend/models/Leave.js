const mongoose = require("mongoose");

const LeaveApplicationSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    reason: { type: String, required: true },
    date: { type: Date, required: true }, // Add the date field
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LeaveApplication", LeaveApplicationSchema);