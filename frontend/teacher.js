async function fetchSubjects() {
    try {
        const response = await fetch("http://localhost:5000/api/subjects/teachers", {
            headers: {
                "Authorization": localStorage.getItem("token") 
            }
        });
        const subjects = await response.json();
        const subjectList = document.getElementById("subject-list");
        subjectList.innerHTML = "";
        subjects.forEach(sub => {
            const li = document.createElement("li");
            li.classList.add("class-item");
            const span = document.createElement("span");
            const className = sub.classId ? sub.classId.name : "Unknown Class";
            span.textContent = `${sub.name} (Class: ${className})`;
            li.appendChild(span);
            subjectList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
}

async function fetchSubjectsDropdown() {
    try {
        const classId = document.getElementById("class-dropdown").value;
        if (!classId) return;

        const response = await fetch(`http://localhost:5000/api/subjects/subjects?classId=${classId}`, {
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

async function fetchClassDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/subjects/classes", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const subjects = await response.json();
        const dropdown = document.getElementById("class-dropdown");
        dropdown.innerHTML = "<option value=''>Select a class</option>";

        subjects.forEach(sub => {
            const option = document.createElement("option");
            option.value = sub._id;
            option.textContent =  sub.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
}

async function fetchReportClassDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/subjects/classes", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const subjects = await response.json();
        const dropdown = document.getElementById("report-class-dropdown");
        dropdown.innerHTML = "<option value=''>Select a class</option>";

        subjects.forEach(sub => {
            const option = document.createElement("option");
            option.value = sub._id;
            option.textContent =  sub.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
}

async function fetchReportSubjectsDropdown() {
    try {
        const classId = document.getElementById("report-class-dropdown").value;
        if (!classId) return;

        const response = await fetch(`http://localhost:5000/api/subjects/subjects?classId=${classId}`, {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const subjects = await response.json();

        const dropdown = document.getElementById("report-subject-dropdown");
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

async function deleteSubject(subjectId) {
    try {
        await fetch(`http://localhost:5000/api/subjects/${subjectId}`, { method: "DELETE" });
        fetchSubjects();
        fetchSubjectsDropdown();
    } catch (error) {
        alert("Error deleting subject");
    }
}

async function fetchAttendance() {
    const classId = document.getElementById("class-dropdown").value;
    const subjectId = document.getElementById("subject-dropdown").value;
    const month = document.getElementById("month-dropdown").value;

    if (!classId || !subjectId || !month) {
        alert("Please select all fields");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/attendance?classId=${classId}&subjectId=${subjectId}&month=${month}`);
        const students = await response.json();

        const tableHeader = document.getElementById("attendance-table-header");
        const tableBody = document.getElementById("attendance-table-body");
        tableHeader.innerHTML = "<th>Student Name</th>"; // Clear previous headers
        tableBody.innerHTML = ""; // Clear previous data

        if (students.length === 0) {
            alert("No students found for this class.");
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
        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${student.name}</td>`;

            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month - 1, i);
                if (date.getDay() !== 0) { // Skip Sundays (0 = Sunday)
                    const isChecked = student.attendance[i] === "Present" ? "checked" : "";
                    row.innerHTML += `<td><input type='checkbox' data-student='${student.id}' data-day='${i}' ${isChecked}></td>`;
                }
                
            }

            tableBody.appendChild(row);
        });

        // Ensure the form is visible
        document.getElementById("attendance-form").classList.remove("hidden");

    } catch (error) {
        console.error("Error fetching attendance:", error);
        alert("Failed to load attendance. Please try again.");
    }
}

async function submitAttendance() {
    const checkboxes = document.querySelectorAll("#attendance-table-body input[type='checkbox']");
    const attendanceData = [];
    
    checkboxes.forEach(checkbox => {
        attendanceData.push({
            studentId: checkbox.dataset.student,
            day: parseInt(checkbox.dataset.day),
            status: checkbox.checked ? "Present" : "Absent"
        });
    });

    const classId = document.getElementById("class-dropdown").value;
    const subjectId = document.getElementById("subject-dropdown").value;
    const month = document.getElementById("month-dropdown").value;

    if (!classId || !subjectId || !month) {
        alert("Please select all fields before submitting attendance");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attendanceData, subjectId, month })
        });

        if (response.ok) {
            alert("Attendance updated successfully");
            await fetchAttendance(); // 🔥 Fetch attendance again to update UI after marking
        } else {
            alert("Failed to update attendance");
        }
    } catch (error) {
        console.error("Error submitting attendance:", error);
        alert("Error submitting attendance. Please try again.");
    }
}

async function generateReport() {
    const classId = document.getElementById("report-class-dropdown").value;
    const subjectId = document.getElementById("report-subject-dropdown").value;
    const month = document.getElementById("report-month-dropdown").value;

    if (!classId || !subjectId || !month) {
        alert("Please select both class and subject");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/attendance/report?classId=${classId}&subjectId=${subjectId}&month=${month}`, {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const reportData = await response.json();
        console.log(reportData);
        const reportContent = document.getElementById("reports-content");
        reportContent.innerHTML = ""; // Clear previous data

        if (!Array.isArray(reportData) || reportData.length === 0) {
            reportContent.innerHTML = "<p>No data available for the selected class and subject.</p>";
            return;
        }

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Attendance Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.map(student => `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.percentage}%</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        reportContent.appendChild(table);
    } catch (error) {
        console.error("Error generating report:", error);
        alert("Failed to generate report. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", fetchSubjects);
document.addEventListener("DOMContentLoaded", fetchClassDropdown);
document.addEventListener("DOMContentLoaded", fetchReportClassDropdown);