function showAdminMenu() {
    const menu = document.getElementById("admin-menu");
    menu.classList.toggle("menu-hide");
}

async function deleteAdminAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        try {
            const response = await fetch("http://localhost:5000/api/auth/delete", {
                method: "DELETE",
                headers: { "Authorization": localStorage.getItem("token") }
            });
            const data = await response.json();
            alert(data.message);
            if (response.ok) {
                localStorage.removeItem("adminToken");
                window.location.href = "login.html";
            }
        } catch (error) {
            alert("Error deleting account");
        }
    }
}

async function changeAdminPassword() {
    const newPassword = prompt("Enter new password:");
    if (newPassword) {
        try {
            const response = await fetch("http://localhost:5000/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify({ password: newPassword })
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            alert("Error changing password");
        }
    }
}

function getAdminUsernameFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payloadBase64 = token.split(".")[1]; // Get the payload part
        const decodedPayload = atob(payloadBase64); // Decode from Base64
        const payload = JSON.parse(decodedPayload); // Parse JSON
        return payload.username || "Admin"; // Return username if present
    } catch (error) {
        console.error("Error decoding token:", error);
        return "Admin";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const adminName = getAdminUsernameFromToken();
    document.getElementById("admin-name").textContent = adminName;
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function showClassForm() {
    const form = document.getElementById("class-form");
    form.classList.toggle("hidden");

    // Ensure input is focused when form is shown
    if (!form.classList.contains("hidden")) {
        document.getElementById("class-name").focus();
    }
}

async function addClass() {
    const className = document.getElementById("class-name").value;
    if (className.trim() === "") {
        alert("Class name cannot be empty");
        return;
    }
    try {
        const response = await fetch("http://localhost:5000/api/classes/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token") // Send token for authentication
            },
            body: JSON.stringify({ name: className })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadClasses(); // Refresh class list
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Server error");
    }

    document.getElementById("class-name").value = "";
    document.getElementById("class-form").classList.add("hidden");
}


async function loadClasses() {
    try {
        const response = await fetch("http://localhost:5000/api/classes/", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const classes = await response.json();

        const classList = document.getElementById("class-list");
        classList.innerHTML = "";

        classes.forEach(c => {
            const li = document.createElement("li");
            li.textContent = c.name;
            li.classList.add('class-item');
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = async function () {
                await deleteClass(c._id);
            };
            
            li.appendChild(deleteBtn);
            classList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading classes", error);
    }
}

async function deleteClass(classId) {
    await fetch(`http://localhost:5000/api/classes/${classId}`, {
        method: "DELETE"
    });
    loadClasses();
}

function showTeacherForm() {
    document.getElementById("teacher-form").classList.toggle("hidden");
}

// Fetch Teachers
async function fetchTeachers() {
    const response = await fetch("http://localhost:5000/api/teachers/", {
        headers: {
            "Authorization": localStorage.getItem("token") // Include token
        }
    });
    const data = await response.json();
    const teacherList = document.getElementById("teacher-list");
    teacherList.innerHTML = "";

    data.forEach(teacher => {
        const li = document.createElement("li");
        li.classList.add("teacher-item");

        const span = document.createElement("span");
        span.textContent = teacher.username;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = async function () {
            await deleteTeacher(teacher._id);
        };

        li.appendChild(span);
        li.appendChild(deleteBtn);
        teacherList.appendChild(li);
    });
}

// Add Teacher
async function addTeacher() {
    const username = document.getElementById("teacher-username").value;
    if (username.trim() === "") {
        alert("Username cannot be empty");
        return;
    }
    await fetch("http://localhost:5000/api/teachers/add", {
        method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token") // Send token for authentication
            },
        body: JSON.stringify({ username })
    });
    document.getElementById("teacher-username").value = "";
    document.getElementById("teacher-form").classList.add("hidden");
    fetchTeachers();
}

// Delete Teacher
async function deleteTeacher(teacherId) {
    await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
        method: "DELETE"
    });
    fetchTeachers();
}

function showStudentForm() {
    document.getElementById("student-form").classList.toggle("hidden");
}

// Fetch Teachers
async function fetchStudents() {
    const response = await fetch("http://localhost:5000/api/students/", {
        headers: {
            "Authorization": localStorage.getItem("token") // Include token
        }
    });
    const data = await response.json();
    const studentList = document.getElementById("student-list");
    studentList.innerHTML = "";

    data.forEach(student => {
        const li = document.createElement("li");
        li.classList.add("student-item");

        const span = document.createElement("span");
        span.textContent = `${student.username} - ${student.classId.name}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = async function () {
            await deleteStudent(student._id);
        };

        li.appendChild(span);
        li.appendChild(deleteBtn);
        studentList.appendChild(li);
    });
}

// Add Teacher
async function addStudent() {
    const username = document.getElementById("student-username").value;
    const classId = document.getElementById("class-student-dropdown").value;
    if (username.trim() =="" || !classId) {
        alert("Please fill in all fields.");
        return;
    }
    console.log(username,classId)
    await fetch("http://localhost:5000/api/students/add", {
        method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token") // Send token for authentication
            },
        body: JSON.stringify({ username, classId})
    });
    document.getElementById("student-username").value = "";
    document.getElementById("student-form").classList.add("hidden");
    fetchStudents();
}

// Delete Teacher
async function deleteStudent(studentId) {
    await fetch(`http://localhost:5000/api/students/${studentId}`, {
        method: "DELETE"
    });
    fetchStudents();
}

function showSubjectForm() {
    document.getElementById("subject-form").classList.toggle("hidden");
}

// ✅ Fetch classes for dropdown
async function fetchClassesForDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/classes/", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const classes = await response.json();
        const dropdown = document.getElementById("class-dropdown");
        dropdown.innerHTML = "<option value=''>Select a class</option>";

        classes.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls._id;
            option.textContent = cls.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
    }
}

async function fetchClassesStudentForDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/classes/", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const classes = await response.json();
        const dropdown = document.getElementById("class-student-dropdown");
        dropdown.innerHTML = "<option value=''>Select a class</option>";

        classes.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls._id;
            option.textContent = cls.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
    }
}
// ✅ Fetch teachers for dropdown
async function fetchTeachersForDropdown() {
    try {
        const response = await fetch("http://localhost:5000/api/teachers/", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const teachers = await response.json();
        const dropdown = document.getElementById("teacher-dropdown");
        dropdown.innerHTML = "<option value=''>Select a teacher</option>";

        teachers.forEach(teacher => {
            const option = document.createElement("option");
            option.value = teacher._id;
            option.textContent = teacher.username;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching teachers:", error);
    }
}

// ✅ Add a new subject
async function addSubject() {
    const subjectName = document.getElementById("subject-name").value;
    const classId = document.getElementById("class-dropdown").value;
    const teacherId = document.getElementById("teacher-dropdown").value;
    if (!subjectName.trim() || !classId || !teacherId) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/subjects/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token") // Send token for authentication
            },
            body: JSON.stringify({ name: subjectName, classId, teacherId })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            fetchSubjects();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Error adding subject");
    }

    document.getElementById("subject-name").value = "";
    document.getElementById("subject-form").classList.add("hidden");
}

// ✅ Fetch and display subjects
async function fetchSubjects() {
    try {
        const response = await fetch("http://localhost:5000/api/subjects/", {
            headers: {
                "Authorization": localStorage.getItem("token") // Include token
            }
        });
        const subjects = await response.json();

        const subjectList = document.getElementById("subject-list");
        subjectList.innerHTML = "";

        subjects.forEach(sub => {
            const li = document.createElement("li");
            li.classList.add("class-item");

            const span = document.createElement("span");
            const teacherName = sub.teacherId ? sub.teacherId.username : "Unassigned";
            const className = sub.classId ? sub.classId.name : "Unknown Class";

            console.log(sub);
            span.textContent = `${sub.name} (Class: ${className}, Teacher: ${teacherName})`;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = async function () {
                await deleteSubject(sub._id);
            };

            li.appendChild(span);
            li.appendChild(deleteBtn);
            subjectList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
}

// ✅ Delete a subject
async function deleteSubject(subjectId) {
    try {
        await fetch(`http://localhost:5000/api/subjects/${subjectId}`, { method: "DELETE" });
        fetchSubjects();
    } catch (error) {
        alert("Error deleting subject");
    }
}

function logoutAdmin() {
    localStorage.removeItem("adminToken"); 
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchClassesForDropdown();
    fetchTeachersForDropdown();
    fetchSubjects();
    fetchClassesStudentForDropdown();
    loadClasses();
    fetchTeachers();
    fetchStudents();
});