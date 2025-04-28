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

async function fetchFeedback() {
    try {
        const response = await fetch("http://localhost:5000/api/feedback/teacher", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const feedbacks = await response.json();

        const feedbackContainer = document.getElementById("feedback-container");
        feedbackContainer.innerHTML = ""; // Clear previous feedback
        
        if (feedbacks.length === 0) {
            feedbackContainer.innerHTML = "<p>No feedback available.</p>";
            return;
        }

        // Group feedback by subjectId
        const feedbackBySubject = feedbacks.reduce((acc, feedback) => {
            if (!acc[feedback.subjectId._id]) {
                acc[feedback.subjectId._id] = [];
            }
            acc[feedback.subjectId._id].push(feedback);
            return acc;
        }, {});
        // Display feedback grouped by subject
        for (const subjectId in feedbackBySubject) {
            const subjectFeedback = feedbackBySubject[subjectId];
            
            // Create a container for each subject's feedback
            const subjectContainer = document.createElement("div");
            subjectContainer.classList.add("subject-container");
        
            // Create a box for the subject
            const subjectBox = document.createElement("div");
            subjectBox.classList.add("feedback-box");
        
            // Add subject name (fetch details if not included in feedback)
            const subjectName = subjectFeedback[0].subjectId.name || "Unknown Subject";
            const subjectTitle = document.createElement("h3");
            subjectTitle.textContent = subjectName;
            subjectBox.appendChild(subjectTitle);
        
            // Add feedback messages
            subjectFeedback.forEach(feedback => {
                const feedbackMessage = document.createElement("p");
                feedbackMessage.textContent = feedback.feedback;
                subjectBox.appendChild(feedbackMessage);
            });
        
            // Append the subject box to the subject container
            subjectContainer.appendChild(subjectBox);
        
            // Append the subject container to the feedback container
            feedbackContainer.appendChild(subjectContainer);
        }
    } catch (error) {
        console.error("Error fetching feedback:", error);
        const feedbackContainer = document.getElementById("feedback-container");
        feedbackContainer.innerHTML = "<p>Failed to load feedback. Please try again later.</p>";
    }
}

async function leaveSubmit(event) {
    event.preventDefault();

    const date = document.getElementById("leave-date").value;
    const reason = document.getElementById("leavemsg").value;
    const applicationsContainer = document.getElementById("applications");

    try {
        const response = await fetch("http://localhost:5000/api/leave/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({ date, reason })
        });

        const result = await response.json();

        if (response.ok) {
            applicationsContainer.textContent = "Leave application submitted successfully.";
            document.getElementById("leave-date").value = ""; // Clear the date input
            document.getElementById("leavemsg").value = ""; // Clear the textarea
            fetchLeaveApplications(); // Refresh the list of applications
        } else {
            applicationsContainer.textContent = result.message || "Failed to submit leave application.";
        }
    } catch (error) {
        console.error("Error submitting leave application:", error);
        applicationsContainer.textContent = "An error occurred. Please try again.";
    }
}

async function fetchLeaveApplications() {
    const applicationsContainer = document.getElementById("applications");

    try {
        const response = await fetch("http://localhost:5000/api/leave/teacher", {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });

        const leaveApplications = await response.json();
        applicationsContainer.innerHTML = ""; // Clear previous applications

        if (leaveApplications.length === 0) {
            applicationsContainer.innerHTML = "<p>No leave applications found.</p>";
            return;
        }

        leaveApplications.forEach(application => {
            const applicationBox = document.createElement("div");
            applicationBox.classList.add("application-box");

            const date = document.createElement("p");
            date.textContent = `Date: ${new Date(application.date).toLocaleDateString()}`;
            applicationBox.appendChild(date);

            const reason = document.createElement("p");
            reason.textContent = `Reason: ${application.reason}`;
            applicationBox.appendChild(reason);

            const status = document.createElement("p");
            status.textContent = `Status: ${application.status}`;
            applicationBox.appendChild(status);

            const submittedAt = document.createElement("p");
            submittedAt.textContent = `Submitted At: ${new Date(application.createdAt).toLocaleString()}`;
            applicationBox.appendChild(submittedAt);

            // Add delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteLeaveApplication(application._id, applicationBox);
            applicationBox.appendChild(deleteButton);

            applicationsContainer.appendChild(applicationBox);
        });
    } catch (error) {
        console.error("Error fetching leave applications:", error);
        applicationsContainer.innerHTML = "<p>Failed to load leave applications. Please try again later.</p>";
    }
}

async function deleteLeaveApplication(leaveId, applicationBox) {
    try {
        const response = await fetch(`http://localhost:5000/api/leave/delete/${leaveId}`, {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });

        if (response.ok) {
            applicationBox.remove(); // Remove the application from the UI
            alert("Leave application deleted successfully.");
        } else {
            const result = await response.json();
            alert(result.message || "Failed to delete leave application.");
        }
    } catch (error) {
        console.error("Error deleting leave application:", error);
        alert("An error occurred. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", fetchSubjects);
document.addEventListener("DOMContentLoaded", fetchClassDropdown);
document.addEventListener("DOMContentLoaded", fetchReportClassDropdown);
document.addEventListener("DOMContentLoaded", fetchFeedback);
document.addEventListener("DOMContentLoaded", fetchLeaveApplications);