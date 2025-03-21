require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const classRoutes = require("./routes/class");
const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");
const subjectRoutes = require("./routes/subject");
const AttendanceRoutes = require("./routes/attendance");
const app= express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Attendance")
    .then(()=>{console.log("MONGO DB Connected");})
    .catch((err)=>{console.log(err);})

app.get("/", (req, res) => {
    res.send("Attendance Tracker API is Running!");
});

app.use("/api/auth", authRoutes);

app.use("/api/classes",classRoutes);

app.use("/api/teachers", teacherRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/subjects", subjectRoutes);

app.use("/api/attendance", AttendanceRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});