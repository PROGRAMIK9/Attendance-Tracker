const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
});

const Subject = mongoose.model("Subject", subjectSchema);
module.exports = Subject;
