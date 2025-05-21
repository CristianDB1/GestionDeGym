document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:8080/api/clientes";
    let table = new DataTable("#clientesTable");

    function loadClientes() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }

        fetch(`${API_URL}/listar`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            table.clear();
            data.forEach(cliente => {
                table.row.add([
                    cliente.idCliente,
                    cliente.nombre,
                    cliente.apellido,
                    cliente.email,
                    cliente.telefono,
                    `<button class="btn btn-warning btn-sm editar-cliente" data-id="${cliente.idCliente}">Editar</button>
                     <button class="btn btn-danger btn-sm eliminar-cliente" data-id="${cliente.idCliente}">Eliminar</button>`
                ]);
            });
            table.draw();
        })
        .catch(error => console.error("Error al cargar clientes:", error));
    }

    function guardarCliente(event) {
        event.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }
        
        const id = document.getElementById("clienteId").value.trim();
        const cliente = {
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            email: document.getElementById("email").value,
            telefono: document.getElementById("telefono").value
        };

        let method = id ? "PUT" : "POST";
        let url = id ? `${API_URL}/actualizar/${id}` : `${API_URL}/crear`;

        fetch(url, {
            method: method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cliente)
            })
            .then(async response => {
            if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al guardar cliente. Status: ${response.status} - ${errorText}`);
        }

        if (response.status === 204) return null;

        return response.json();
        })
        .then(() => {
            document.getElementById("clienteForm").reset(); // Limpiar formulario
            document.getElementById("clienteId").value = "";
            $("#clienteModal").modal("hide");
            loadClientes();
        })
        .catch(error => console.error("Error al guardar cliente:", error));
    }

    function editarCliente(id) {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }

        fetch(`${API_URL}/buscar/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(cliente => {
            document.getElementById("clienteId").value = cliente.idCliente;
            document.getElementById("nombre").value = cliente.nombre;
            document.getElementById("apellido").value = cliente.apellido;
            document.getElementById("email").value = cliente.email;
            document.getElementById("telefono").value = cliente.telefono;
            $("#clienteModal").modal("show");
        })
        .catch(error => console.error("Error al obtener cliente:", error));
    }

    function eliminarCliente(id) {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }
        
        if (confirm("¿Seguro que deseas eliminar este cliente?")) {
            fetch(`${API_URL}/eliminar/${id}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al eliminar cliente. Status: ${response.status}`);
                }
                return response.text();
            })
            .then(() => {
                alert("Cliente eliminado correctamente.");
                loadClientes();
            })
            .catch(error => console.error("Error al eliminar cliente:", error));
        }
    }

    document.getElementById("clienteForm").addEventListener("submit", guardarCliente);

    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("editar-cliente")) {
            editarCliente(event.target.dataset.id);
        } else if (event.target.classList.contains("eliminar-cliente")) {
            eliminarCliente(event.target.dataset.id);
        }
    });

    loadClientes();
});
