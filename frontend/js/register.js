document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const usuario = {
        nombre: nombre,
        apellido: apellido,
        username: username,
        password: password,
        rol_id: 2 // El rol de recepcionista (asumimos que 2 es el ID de RECEPCIONISTA)
    };

    try {
        const response = await fetch("http://localhost:8080/api/auth/crear", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        if (response.ok) {
            window.location.href = "login.html"; // Redirige al login después de registrarse
        } else {
            document.getElementById("error-message").style.display = "block";
        }
    } catch (error) {
        console.error("Error en el registro:", error);
        document.getElementById("error-message").style.display = "block";
    }
});
