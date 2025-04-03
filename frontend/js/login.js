document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const errorMessage = document.getElementById("error-message");
        
        if (!usernameInput || !passwordInput) {
            console.error("Elementos del formulario no encontrados");
            return;
        }
        
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                throw new Error("Usuario o contraseña incorrectos");
            }
            
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            // Evitar que el usuario regrese al login después de iniciar sesión
            history.replaceState(null, null, window.location.href);

            if (data.role === "ADMIN") {
                window.location.href = "../pages/admin_dashboard.html";
            } else if (data.role === "RECEPCIONISTA") {
                window.location.href = "../pages/recepcionista_dashboard.html";
            }       

        } catch (error) {
            errorMessage.style.display = "block";
            errorMessage.textContent = error.message;
        }
    });
    
});



