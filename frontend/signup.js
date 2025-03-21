document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(role,username,password)
    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password, role})
        });

        const data = await response.json();

        if (response.ok) {
            alert("Sign-up successful! Please log in.");
            window.location.href = "login.html"; // Redirect to login
        } else {
            document.getElementById("error-message").textContent = data.message;
        }
    } catch (error) {
        document.getElementById("error-message").textContent = "Server error!";
    }
});
