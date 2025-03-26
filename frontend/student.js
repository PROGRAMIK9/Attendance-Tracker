var classId = "";

async function fetchClass(){
    try {
        const response = await fetch("http://localhost:5000/api/students/class", {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
        const studentData = await response.json();
        classId = studentData.classId._id;
        console.log(classId);
    } catch (error) {
        console.error('Error fetching class:', error);
    }
}

async function fetchSubjects() {
    try {
        const response = await fetch("http://localhost:5000/api/subjects/students", {
            headers: {
                "Authorization": localStorage.getItem("token") 
            }
        });
        const subjects = await response.json();
        const subjectsList = document.getElementById('subjects-list');
        subjectsList.innerHTML = '';
        subjects.forEach(subject => {
            const li = document.createElement('li');
            li.textContent = subject.name;
            subjectsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
    }
}

async function fetchSubjectsDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/subjects/students", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const subjects = await response.json();

        const dropdown = document.getElementById("subject-dropdown");
        dropdown.innerHTML = "<option value=''>Select a subject</option>";

        subjects.forEach(sub => {
            const option = document.createElement("option");
            option.value = sub._id;
            option.textContent = sub.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
}


async function fetchFeedSubjectsDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/subjects/students", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const subjects = await response.json();

        const dropdown = document.getElementById("feed-subject-dropdown");
        dropdown.innerHTML = "<option value=''>Select a subject</option>";

        subjects.forEach(sub => {
            const option = document.createElement("option");
            option.value = sub._id;
            option.textContent = sub.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
}

async function fetchAttendance() {
    const subjectId = document.getElementById("subject-dropdown").value;
    const month = document.getElementById("month-dropdown").value;
    if (!classId || !subjectId || !month) {
        alert("Please select all fields");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/attendance/student?subjectId=${subjectId}&month=${month}`, {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const attendanceRecords = await response.json();

        if (!Array.isArray(attendanceRecords)) {
            throw new Error("Invalid response format");
        }

        const tableHeader = document.getElementById("attendance-table-header");
        const tableBody = document.getElementById("attendance-table-body");
        tableHeader.innerHTML = "<th>Student Name</th>"; // Clear previous headers
        tableBody.innerHTML = "";

        if (attendanceRecords.length === 0) {
            alert("No attendance records found for this class.");
            return;
        }

        // Get number of days in the selected month
        const year = new Date().getFullYear();
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
              const date = new Date(year, month - 1, i);
            if (date.getDay() !== 0) { // Skip Sundays (0 = Sunday)
                const th = document.createElement("th");
                th.textContent = i;
                tableHeader.appendChild(th);
            }
        }
        const row = document.createElement("tr");
        row.innerHTML = `<td>${attendanceRecords[1].student.username}</td>`;
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month - 1, i);
            if (date.getDay() !== 0) { // Skip Sundays (0 = Sunday)
                const record = attendanceRecords.find(record => new Date(record.date).getDate() === i);
                const isChecked = record && record.status === "Present" ? "checked" : "";
                row.innerHTML += `<td><input type='checkbox' data-student='${record.student._id}' ${isChecked} onclick="return false"></td>`;
            }
        }
        tableBody.appendChild(row);
        // Calculate and display attendance percentage
        const attendancePercentage = calculateAttendancePercentage(attendanceRecords, daysInMonth);
        document.getElementById("attendance-percentage").textContent = `Attendance Percentage: ${attendancePercentage}%`;

        // Ensure the form is visible
        document.getElementById("attendance-form").classList.remove("hidden");

    } catch (error) {
        console.error("Error fetching attendance:", error);
        alert("Failed to load attendance. Please try again.");
    }
}

function calculateAttendancePercentage(records, daysInMonth) {
    const presentDays = records.filter(record => record.status === "Present").length;
    return ((presentDays / daysInMonth) * 100).toFixed(2);
}

async function feedbackSubmit(event) {
    event.preventDefault();

    const subjectId = document.getElementById("feed-subject-dropdown").value;
    const feedback = document.getElementById("feedbackmsg").value;
    const feedbackMessages = document.getElementById("feedback-messages");
    console.log(subjectId, feedback);
    try {
        const response = await fetch("http://localhost:5000/api/feedback/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({ subjectId, feedback })
        });

        const result = await response.json();

        if (response.ok) {
            feedbackMessages.textContent = "Feedback submitted successfully.";
            document.getElementById("feedback").value = ""; // Clear the textarea
        } else {
            feedbackMessages.textContent = result.message || "Failed to submit feedback.";
        }
    } catch (error) {
        console.error("Error submitting feedback:", error);
        feedbackMessages.textContent = "An error occurred. Please try again.";
    }
}


async function fetchMonthlyReport() {
    const month = document.getElementById("report-month-dropdown").value;
    if (!month) {
        alert("Please select a month");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/attendance/student/monthly?month=${month}&classId=${classId}`, {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const reportData = await response.json();

        if (!Array.isArray(reportData)) {
            throw new Error("Invalid response format");
        }

        const reportTableBody = document.getElementById("report-table-body");
        reportTableBody.innerHTML = ""; // Clear previous data

        reportData.forEach(subjectReport => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${subjectReport.subjectName}</td><td>${subjectReport.attendancePercentage}%</td>`;
            reportTableBody.appendChild(row);
        });

        // Ensure the report section is visible
        document.getElementById("monthly-report-section").classList.remove("hidden");

    } catch (error) {
        console.error("Error fetching monthly report:", error);
        alert("Failed to load monthly report. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", fetchClass);
document.addEventListener("DOMContentLoaded", fetchSubjects);
document.addEventListener("DOMContentLoaded", fetchSubjectsDropdown);
document.addEventListener("DOMContentLoaded", fetchFeedSubjectsDropdown);