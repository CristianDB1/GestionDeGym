document.addEventListener("DOMContentLoaded", () => {
  const API_PROVEEDORES = "http://localhost:8080/api/proveedores";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Token no disponible");
    return;
  }

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  let tablaProveedores = new DataTable("#tablaProveedores");
  let tablaProductos = new DataTable("#tablaProductos");

  function cargarProveedores() {
    fetch(`${API_PROVEEDORES}/listar`, { headers })
      .then(res => res.json())
      .then(data => {
        tablaProveedores.clear();
        data.forEach(p => {
          tablaProveedores.row.add([
            p.id_proveedor,
            p.nombre,
            p.telefono,
            p.direccion,
            `
              <button class="btn btn-warning btn-sm editar-proveedor" data-id="${p.id_proveedor}">Editar</button>
              <button class="btn btn-danger btn-sm eliminar-proveedor" data-id="${p.id_proveedor}">Eliminar</button>
            `
          ]);
        });
        tablaProveedores.draw();
      });
  }

  document.getElementById("proveedorForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = document.getElementById("proveedorId").value;
    const proveedor = {
      nombre: document.getElementById("proveedorNombre").value,
      telefono: document.getElementById("proveedorTelefono").value,
      direccion: document.getElementById("proveedorDireccion").value
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_PROVEEDORES}/actualizar/${id}` : `${API_PROVEEDORES}/crear`;

    fetch(url, {
      method,
      headers,
      body: JSON.stringify(proveedor)
    })
      .then(res => res.ok ? res.json() : Promise.reject("Error al guardar"))
      .then(() => {
        cargarProveedores();
        $("#proveedorModal").modal("hide");
        document.getElementById("proveedorForm").reset();
        document.getElementById("proveedorId").value = "";
      })
      .catch(err => console.error("Error al guardar proveedor:", err));
  });

  document.querySelector("#tablaProveedores tbody").addEventListener("click", e => {
    if (e.target.classList.contains("editar-proveedor")) {
      const id = e.target.dataset.id;
      fetch(`${API_PROVEEDORES}/buscar/${id}`, { headers })
        .then(res => res.json())
        .then(p => {
          document.getElementById("proveedorId").value = p.id_proveedor;
          document.getElementById("proveedorNombre").value = p.nombre;
          document.getElementById("proveedorTelefono").value = p.telefono;
          document.getElementById("proveedorDireccion").value = p.direccion;
          $("#proveedorModal").modal("show");
        });
    }

    if (e.target.classList.contains("eliminar-proveedor")) {
      const id = e.target.dataset.id;
      if (confirm("¿Seguro que deseas eliminar este proveedor?")) {
        fetch(`${API_PROVEEDORES}/eliminar/${id}`, {
          method: "DELETE",
          headers
        }).then(() => cargarProveedores());
      }
    }
  });

  function cargarProductos() {
    fetch(`${API_PRODUCTOS}/listar`, { headers })
      .then(res => res.json())
      .then(data => {
        tablaProductos.clear();
        data.forEach(p => {
          tablaProductos.row.add([
            p.id_producto,
            p.nombre,
            p.descripcion,
            p.precio,
            p.stock,
            `
              <button class="btn btn-warning btn-sm editar-producto" data-id="${p.id_producto}">Editar</button>
              <button class="btn btn-danger btn-sm eliminar-producto" data-id="${p.id_producto}">Eliminar</button>
            `
          ]);
        });
        tablaProductos.draw();
      });
  }

  document.getElementById("productoForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = document.getElementById("productoId").value;
    const producto = {
      nombre: document.getElementById("productoNombre").value,
      descripcion: document.getElementById("productoDescripcion").value,
      precio: parseFloat(document.getElementById("productoPrecio").value),
      stock: parseInt(document.getElementById("productoStock").value)
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_PRODUCTOS}/actualizar/${id}` : `${API_PRODUCTOS}/crear`;

    fetch(url, {
      method,
      headers,
      body: JSON.stringify(producto)
    })
      .then(res => res.ok ? res.json() : Promise.reject("Error al guardar"))
      .then(() => {
        cargarProductos();
        $("#productoModal").modal("hide");
        document.getElementById("productoForm").reset();
        document.getElementById("productoId").value = "";
      })
      .catch(err => console.error("Error al guardar producto:", err));
  });

  document.querySelector("#tablaProductos tbody").addEventListener("click", e => {
    if (e.target.classList.contains("editar-producto")) {
      const id = e.target.dataset.id;
      fetch(`${API_PRODUCTOS}/buscar/${id}`, { headers })
        .then(res => res.json())
        .then(p => {
          document.getElementById("productoId").value = p.id_producto;
          document.getElementById("productoNombre").value = p.nombre;
          document.getElementById("productoDescripcion").value = p.descripcion;
          document.getElementById("productoPrecio").value = p.precio;
          document.getElementById("productoStock").value = p.stock;
          $("#productoModal").modal("show");
        });
    }

    if (e.target.classList.contains("eliminar-producto")) {
      const id = e.target.dataset.id;
      if (confirm("¿Seguro que deseas eliminar este producto?")) {
        fetch(`${API_PRODUCTOS}/eliminar/${id}`, {
          method: "DELETE",
          headers
        }).then(() => cargarProductos());
      }
    }
  });

  cargarProveedores();
  cargarProductos();
});