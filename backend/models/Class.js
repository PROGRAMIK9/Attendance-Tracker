const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
    name: { type: String, required: true},
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true } // Link to the admin
});

module.exports = mongoose.model("Class", ClassSchema);