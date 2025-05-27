let productosCompra = [];

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
      select.innerHTML = '<option value="">Seleccione un proveedor</option>';
      data.forEach(proveedor => {
        const option = document.createElement("option");
        option.value = proveedor.id_proveedor;
        option.textContent = proveedor.nombre;
        select.appendChild(option);
      });
    });
}

function cargarProductos() {
  fetch("http://localhost:8080/api/productos/listar", authHeader())
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("productoSelect");
      select.innerHTML = '<option value="">Seleccione un producto</option>';
      data.forEach(producto => {
        const option = document.createElement("option");
        option.value = producto.id_producto;
        option.textContent = `${producto.nombre} (Stock: ${producto.stock})`;
        option.dataset.nombre = producto.nombre;
        select.appendChild(option);
      });
    });
}

function calcularTotal() {
  const total = productosCompra.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
  document.getElementById("totalCompra").textContent = total.toFixed(2);
}

function renderTabla() {
  const tbody = document.querySelector("#tablaCompra tbody");
  tbody.innerHTML = "";
  productosCompra.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>${p.precio_unitario}</td>
      <td>${(p.cantidad * p.precio_unitario).toFixed(2)}</td>
      <td><button class='btn btn-danger btn-sm' onclick='eliminarProducto(${index})'>Eliminar</button></td>
    `;
    tbody.appendChild(row);
  });
  calcularTotal();
}

function eliminarProducto(index) {
  productosCompra.splice(index, 1);
  renderTabla();
}

document.getElementById("agregarProducto").addEventListener("click", () => {
  const select = document.getElementById("productoSelect");
  const id = parseInt(select.value);
  const nombre = select.options[select.selectedIndex].text.split(" (")[0];
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const precio = parseFloat(document.getElementById("precio").value);

  if (!id || !cantidad || !precio || cantidad < 1 || precio < 1) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  productosCompra.push({
    producto: { id_producto: id },
    nombre,
    cantidad,
    precio_unitario: precio
  });

  document.getElementById("cantidad").value = "";
  document.getElementById("precio").value = "";
  renderTabla();
});

// Enviar compra al backend
document.getElementById("guardarCompra").addEventListener("click", () => {
  const proveedorSelect = document.getElementById("proveedorSelect");
  const proveedorId = parseInt(proveedorSelect.value);
  if (!proveedorId || productosCompra.length === 0) {
    alert("Seleccione un proveedor y al menos un producto");
    return;
  }

  const payload = {
    proveedor: { id_proveedor: proveedorId },
    productos: productosCompra.map(p => ({
      producto: p.producto,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario
    }))
  };

  fetch("http://localhost:8080/api/compras/crear", {
    method: "POST",
    ...authHeader(),
    body: JSON.stringify(payload)
  })
    .then(res => {
        if (!res.ok) throw new Error("Error al registrar la compra");
        return res.text(); 
    })
    .then(() => {
      alert("Compra registrada exitosamente");
      productosCompra = [];
      document.getElementById("compraForm").reset();
      document.getElementById("productoSelect").value = "";
      renderTabla();
    })
    .catch(err => alert(err.message));
});

window.addEventListener("DOMContentLoaded", () => {
  cargarProveedores();
  cargarProductos();
  document.getElementById("username").textContent = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).sub;
});
