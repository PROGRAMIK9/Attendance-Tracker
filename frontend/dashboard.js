const token = localStorage.getItem("token");

if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "index.html"; // Redirect to login page
}