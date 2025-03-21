document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password, role})
        });

        const data = await response.json();
        console.log("Server Response:", data);
        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            alert("Login successful!");

            // Redirect based on role
            if (data.role === "admin") window.location.href = "admin-dashboard.html";
            else if (data.role === "teacher") window.location.href = "teacher-dashboard.html";
            else if (data.role === "student") window.location.href = "student-dashboard.html";
        } else {
            document.getElementById("error-message").textContent = data.message;
        }
    } catch (error) {
        document.getElementById("error-message").textContent = "Server error!";
    }
});
