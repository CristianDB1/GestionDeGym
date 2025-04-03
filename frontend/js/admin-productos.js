document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:8080/api/productos";
    let table = new DataTable("#productosTable");

    function loadProductos() {
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
            data.forEach(producto => {
                table.row.add([
                    producto.id_producto,
                    producto.nombre,
                    producto.descripcion,
                    producto.precio,
                    producto.stock,
                    `<button class="btn btn-warning btn-sm editar-producto" data-id="${producto.id_producto}">Editar</button>
                     <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id_producto}">Eliminar</button>`
                ]);
            });
            table.draw();
        })
        .catch(error => console.error("Error al cargar productos:", error));
    }

    function guardarProducto(event) {
        event.preventDefault();

        const id = document.getElementById("productoId").value;
        const producto = {
            nombre: document.getElementById("nombre").value,
            descripcion: document.getElementById("descripcion").value,
            precio: parseFloat(document.getElementById("precio").value),
            stock: parseInt(document.getElementById("stock").value)
        };

        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}/actualizar/${id}` : `${API_URL}/crear`;

        fetch(url, {
            method: method,
            headers: { 
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(producto)
        })
        .then(response => response.json())
        .then(() => {
            document.getElementById("productoForm").reset(); // Limpiar formulario
            document.getElementById("productoId").value = "";
            $("#productoModal").modal("hide");
            loadProductos(); // Recargar la lista de productos
        })
        .catch(error => console.error("Error al guardar producto:", error));
    }

    function editarProducto(id) {
        fetch(`${API_URL}/buscar/${id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => response.json())
        .then(producto => {
            document.getElementById("productoId").value = producto.id_producto;
            document.getElementById("nombre").value = producto.nombre;
            document.getElementById("descripcion").value = producto.descripcion;
            document.getElementById("precio").value = producto.precio;
            document.getElementById("stock").value = producto.stock;
            $("#productoModal").modal("show");
        })
        .catch(error => console.error("Error al obtener producto:", error));
    }

    function eliminarProducto(id) {
        if (confirm("¿Seguro que deseas eliminar este producto?")) {
            fetch(`${API_URL}/eliminar/${id}`, { 
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            })
            .then(() => {
                loadProductos(); // Recargar la tabla después de eliminar
            })
            .catch(error => console.error("Error al eliminar producto:", error));
        }
    }

    document.getElementById("productoForm")?.addEventListener("submit", guardarProducto);

    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("editar-producto")) {
            editarProducto(event.target.dataset.id);
        } else if (event.target.classList.contains("eliminar-producto")) {
            eliminarProducto(event.target.dataset.id);
        }
    });

    loadProductos();

    // Limpiar modal al abrir para agregar nuevo producto
    document.getElementById("btnAgregarProducto")?.addEventListener("click", function() {
        document.getElementById("productoForm").reset();
        document.getElementById("productoId").value = "";
    });
});
