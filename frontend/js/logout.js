document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Reemplazar la página en el historial para que no pueda volver con "atrás"
    window.location.replace("../index.html");
});
