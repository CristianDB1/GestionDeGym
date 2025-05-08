// admin-productos.js

let table;
let tableProveedores;

// Al cargar el documento
document.addEventListener("DOMContentLoaded", function () {
    table = new DataTable("#productosTable");
    tableProveedores = new DataTable("#proveedoresTable");

    cargarProveedores();
    cargarProductos();

    document.getElementById("proveedorForm").addEventListener("submit", guardarProveedor);
    document.getElementById("productoForm").addEventListener("submit", guardarProducto);

    document.querySelector("#productosTable tbody").addEventListener("click", function (e) {
        if (e.target.classList.contains("editar-producto")) {
            editarProducto(e.target.dataset.id);
        }
        if (e.target.classList.contains("eliminar-producto")) {
            eliminarProducto(e.target.dataset.id);
        }
    });

    document.querySelector("#proveedoresTable tbody").addEventListener("click", function (e) {
        if (e.target.classList.contains("eliminar-proveedor")) {
            eliminarProveedor(e.target.dataset.id);
        }
        if (e.target.classList.contains("editar-proveedor")) {
            editarProveedor(e.target.dataset.id);
        }
    });

    document.getElementById("btnAgregarProducto")?.addEventListener("click", () => {
        document.getElementById("productoForm").reset();
        document.getElementById("productoId").value = "";
    });
});

function authHeader() {
    return {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        }
    };
}

function cargarProveedores() {
    fetch("http://localhost:8080/api/proveedores/listar", authHeader())
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("proveedorSelect");
            if (!select) return;
            const valorSeleccionado = select.value;
            select.innerHTML = '<option value="">Seleccione un proveedor</option>';
            data.forEach(p => {
                const option = document.createElement("option");
                option.value = p.id_proveedor;
                option.textContent = p.nombre;
                select.appendChild(option);
            });
            select.value = valorSeleccionado;
            cargarTablaProveedores(data);
        });
}

function cargarTablaProveedores(data) {
    tableProveedores.clear();
    data.forEach(p => {
        tableProveedores.row.add([
            p.id_proveedor,
            p.nombre,
            p.telefono,
            p.direccion,
            `<button class='btn btn-warning btn-sm editar-proveedor' data-id='${p.id_proveedor}'>Editar</button>
             <button class='btn btn-danger btn-sm eliminar-proveedor' data-id='${p.id_proveedor}'>Eliminar</button>`
        ]);
    });
    tableProveedores.draw();
}

function guardarProveedor(e) {
    e.preventDefault();

    const id = document.getElementById("proveedorId")?.value;

    const proveedor = {
        nombre: document.getElementById("nombreProveedor").value,
        telefono: document.getElementById("telefonoProveedor").value,
        direccion: document.getElementById("direccionProveedor").value
    };

    const url = id ? `http://localhost:8080/api/proveedores/actualizar/${id}` : "http://localhost:8080/api/proveedores/crear";
    const method = id ? "PUT" : "POST";
    fetch(url, {
        method,
        ...authHeader(),
        body: JSON.stringify(proveedor)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return response.json();
        })
        .then(() => {
            document.getElementById("proveedorForm").reset();
            if (document.getElementById("proveedorId")) document.getElementById("proveedorId").value = "";
            cargarProveedores();
        })
        .catch(err => console.error("Error al guardar proveedor:", err));
}

function editarProveedor(id) {
    fetch(`http://localhost:8080/api/proveedores/buscar/${id}`, authHeader())
        .then(res => res.json())
        .then(p => {
            if (!document.getElementById("proveedorId")) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.id = "proveedorId";
                input.name = "proveedorId";
                document.getElementById("proveedorForm").appendChild(input);
            }
            document.getElementById("proveedorId").value = p.id_proveedor;
            document.getElementById("nombreProveedor").value = p.nombre;
            document.getElementById("telefonoProveedor").value = p.telefono;
            document.getElementById("direccionProveedor").value = p.direccion;
        });
}

function eliminarProveedor(id) {
    if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;
    fetch(`http://localhost:8080/api/proveedores/eliminar/${id}`, {
        method: "DELETE",
        ...authHeader()
    })
        .then(() => cargarProveedores());
}

function cargarProductos() {
    fetch("http://localhost:8080/api/productos/listar", authHeader())
        .then(res => res.json())
        .then(data => {
            table.clear();
            data.forEach(p => {
                table.row.add([
                    p.id_producto,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.proveedor?.nombre || "-",
                    `<button class='btn btn-warning btn-sm editar-producto' data-id='${p.id_producto}'>Editar</button>
                     <button class='btn btn-danger btn-sm eliminar-producto' data-id='${p.id_producto}'>Eliminar</button>`
                ]);
            });
            table.draw();
        });
}

function guardarProducto(e) {
    e.preventDefault();

    const proveedorId = document.getElementById("proveedorSelect").value;
    if (!proveedorId) {
        alert("Debe seleccionar un proveedor");
        return;
    }

    const id = document.getElementById("productoId").value;
    const producto = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        precio: parseFloat(document.getElementById("precio").value),
        stock: parseInt(document.getElementById("stock").value),
        proveedor: {
            id_proveedor: parseInt(proveedorId)
        }
    };

    const url = id ? `http://localhost:8080/api/productos/actualizar/${id}` : "http://localhost:8080/api/productos/crear";
    const method = id ? "PUT" : "POST";

    fetch(url, {
        method,
        ...authHeader(),
        body: JSON.stringify(producto)
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById("productoForm").reset();
            document.getElementById("productoId").value = "";
            cargarProveedores();
            cargarProductos();
        });
}

function editarProducto(id) {
    fetch(`http://localhost:8080/api/productos/buscar/${id}`, authHeader())
        .then(res => res.json())
        .then(p => {
            document.getElementById("productoId").value = p.id_producto;
            document.getElementById("nombre").value = p.nombre;
            document.getElementById("descripcion").value = p.descripcion;
            document.getElementById("precio").value = p.precio;
            document.getElementById("stock").value = p.stock;
            document.getElementById("proveedorSelect").value = p.proveedor?.id_proveedor || "";
        });
}

function eliminarProducto(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    fetch(`http://localhost:8080/api/productos/eliminar/${id}`, {
        method: "DELETE",
        ...authHeader()
    })
        .then(() => cargarProductos());
}
