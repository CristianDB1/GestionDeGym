document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../index.html";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        document.getElementById("usernamePlaceholder").textContent = payload.sub || "Administrador";
    } catch (error) {
        console.error("Error al decodificar el token:", error);
    }

    document.getElementById("sidebarToggle").addEventListener("click", function() {
        document.querySelector(".sidebar").classList.toggle("active");
        document.querySelector(".main-content").classList.toggle("active");
    });

    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.removeItem("token");
        window.location.href = "../index.html";
    });

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});