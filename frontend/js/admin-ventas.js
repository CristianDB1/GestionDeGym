// admin-ventas.js

let productosVenta = [];

function authHeader() {
  return {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    }
  };
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
        option.dataset.stock = producto.stock;
        select.appendChild(option);
      });
    });
}

function calcularTotal() {
  const total = productosVenta.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
  document.getElementById("totalVenta").textContent = total.toFixed(2);
}

function renderTabla() {
  const tbody = document.querySelector("#tablaVenta tbody");
  tbody.innerHTML = "";
  productosVenta.forEach((p, index) => {
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
  productosVenta.splice(index, 1);
  renderTabla();
}

// Agregar producto a la tabla
document.getElementById("agregarProducto").addEventListener("click", () => {
  const select = document.getElementById("productoSelect");
  const id = parseInt(select.value);
  const nombre = select.options[select.selectedIndex].text.split(" (")[0];
  const stock = parseInt(select.options[select.selectedIndex].dataset.stock);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const precio = parseFloat(document.getElementById("precio").value);

  if (!id || !cantidad || !precio || cantidad < 1 || precio < 1) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  if (cantidad > stock) {
    alert("No hay suficiente stock disponible.");
    return;
  }

  productosVenta.push({
    producto: { id_producto: id },
    nombre,
    cantidad,
    precio_unitario: precio
  });

  document.getElementById("cantidad").value = "";
  document.getElementById("precio").value = "";
  renderTabla();
});

// Enviar venta al backend
document.getElementById("guardarVenta").addEventListener("click", () => {
  if (productosVenta.length === 0) {
    alert("Agrega al menos un producto a la venta");
    return;
  }

  const payload = {
    productos: productosVenta.map(p => ({
      producto: p.producto,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario
    }))
  };

  fetch("http://localhost:8080/api/ventas/crear", {
    method: "POST",
    ...authHeader(),
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al registrar la venta");
      return res.text();
    })
    .then(() => {
      alert("Venta registrada exitosamente");
      productosVenta = [];
      document.getElementById("ventaForm").reset();
      renderTabla();
    })
    .catch(err => alert(err.message));
});

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  document.getElementById("username").textContent = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).sub;
});
