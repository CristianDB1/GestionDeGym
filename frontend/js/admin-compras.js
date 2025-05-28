document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:8080/api";
  const token = localStorage.getItem("token");
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  let productosEnCompra = [];

  function cargarProveedores() {
    fetch(`${API_URL}/proveedores/listar`, { headers })
      .then(res => res.json())
      .then(data => {
        const select = document.getElementById("proveedorSelect");
        data.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id_proveedor;
          opt.textContent = `${p.nombre}`;
          select.appendChild(opt);
        });
        $("#proveedorSelect").select2({ placeholder: "Seleccione proveedor" });
      })
      .catch(err => console.error("Error al cargar proveedores:", err));
  }

  function cargarProductos() {
    fetch(`${API_URL}/productos/listar`, { headers })
      .then(res => res.json())
      .then(data => {
        const select = document.getElementById("productoSelect");
        data.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id_producto;
          opt.textContent = `${p.nombre}`;
          select.appendChild(opt);
        });
        $("#productoSelect").select2({ placeholder: "Seleccione producto" });
      })
      .catch(err => console.error("Error al cargar productos:", err));
  }

  function renderizarTablaCompra() {
    const tbody = document.querySelector("#tablaCompra tbody");
    tbody.innerHTML = "";

    let totalCompra = 0;

    productosEnCompra.forEach((item, index) => {
      const fila = document.createElement("tr");

      const total = item.precio * item.cantidad;
      totalCompra += total;

      fila.innerHTML = `
        <td>${item.productoNombre}</td>
        <td>${item.proveedorNombre}</td>
        <td>${item.cantidad}</td>
        <td>${item.precio.toFixed(2)}</td>
        <td>${total.toFixed(2)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="eliminarFila(${index})">Eliminar</button></td>
      `;

      tbody.appendChild(fila);
    });

    document.getElementById("totalCompra").textContent = totalCompra.toFixed(2);
  }

  document.getElementById("formAgregarProducto").addEventListener("submit", function (e) {
    e.preventDefault();

    const proveedorSelect = document.getElementById("proveedorSelect");
    const productoSelect = document.getElementById("productoSelect");
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio").value);

    const proveedorId = proveedorSelect.value;
    const proveedorNombre = proveedorSelect.options[proveedorSelect.selectedIndex].text;
    const productoId = productoSelect.value;
    const productoNombre = productoSelect.options[productoSelect.selectedIndex].text;

    if (!proveedorId || !productoId || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio < 0) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
    }

    const existente = productosEnCompra.find(item =>
      item.productoId === productoId && item.proveedorId === proveedorId
    );

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      productosEnCompra.push({
        productoId,
        productoNombre,
        proveedorId,
        proveedorNombre,
        cantidad,
        precio
      });
    }

    renderizarTablaCompra();
    this.reset();
    $("#productoSelect").val(null).trigger("change");
  });

  window.eliminarFila = function (index) {
    productosEnCompra.splice(index, 1);
    renderizarTablaCompra();
  };

  document.getElementById("btnRegistrarCompra").addEventListener("click", function () {
    if (productosEnCompra.length === 0) {
      alert("Agregue al menos un producto.");
      return;
    }

    const compra = {
      productos: productosEnCompra.map(item => ({
        productoId: item.productoId,
        proveedorId: item.proveedorId,
        cantidad: item.cantidad,
        precio: item.precio
      }))
    };

    fetch(`${API_URL}/compras/registrar`, {
      method: "POST",
      headers,
      body: JSON.stringify(compra)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al registrar compra");
        return res.text();
      })
      .then(() => {
        alert("Compra registrada correctamente.");
        productosEnCompra = [];
        renderizarTablaCompra();
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Ocurrió un error al registrar la compra.");
      });
  });

  function cargarHistorialCompras() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("http://localhost:8080/api/compras/listar", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(compras => {
      const tabla = $("#tablaHistorialCompras").DataTable();
      tabla.clear();

      compras.forEach(c => {
        const productosHtml = c.productos.map(p =>
          `${p.producto} (x${p.cantidad}) - ${p.proveedor}<br>`
        ).join("");

        tabla.row.add([
          c.id,
          c.fecha,
          productosHtml,
          `${c.total} COP`
        ]);
      });

      tabla.draw();
    })
    .catch(err => console.error("Error al cargar historial de compras:", err));
}

  $('#tablaHistorialCompras').DataTable();
  cargarHistorialCompras();
  cargarProveedores();
  cargarProductos();
});
