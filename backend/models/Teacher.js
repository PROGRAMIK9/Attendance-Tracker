const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TeacherSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }// Reference to Subject model
});

// Hash password before saving
TeacherSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("Teacher", TeacherSchema);
