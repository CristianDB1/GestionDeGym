document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:8080/api";
  const token = localStorage.getItem("token");
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  let productosEnVenta = [];

  function cargarProductos() {
    fetch(`${API_URL}/productos/listar`, { headers })
      .then(res => res.json())
      .then(productos => {
        const select = document.getElementById("productoSelect");
        select.innerHTML = "<option value=''>Seleccione un producto</option>";
        productos.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id_producto;
          opt.textContent = `${p.nombre} (Stock: ${p.stock})`;
          opt.dataset.stock = p.stock;
          select.appendChild(opt);
        });
        $("#productoSelect").select2({ placeholder: "Seleccione producto" });
      });
  }

  function renderizarTablaVenta() {
    const tbody = document.querySelector("#tablaVenta tbody");
    tbody.innerHTML = "";
    let totalVenta = 0;

    productosEnVenta.forEach((item, index) => {
      const subtotal = item.cantidad * item.precio;
      totalVenta += subtotal;

      const fila = `
        <tr>
          <td>${item.nombre}</td>
          <td>${item.cantidad}</td>
          <td>${item.precio.toFixed(2)}</td>
          <td>${subtotal.toFixed(2)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">Eliminar</button></td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });

    document.getElementById("totalVenta").textContent = totalVenta.toFixed(2);
  }

  window.eliminarProducto = function (index) {
    productosEnVenta.splice(index, 1);
    renderizarTablaVenta();
  };

  document.getElementById("formAgregarVenta").addEventListener("submit", function (e) {
    e.preventDefault();

    const select = document.getElementById("productoSelect");
    const productoId = select.value;
    const productoNombre = select.options[select.selectedIndex].text;
    const stock = parseInt(select.options[select.selectedIndex].dataset.stock);
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio").value);

    if (!productoId || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio < 0) {
      return alert("Complete todos los campos correctamente.");
    }

    if (cantidad > stock) {
      return alert("La cantidad no puede superar el stock disponible.");
    }

    const existente = productosEnVenta.find(p => p.id === productoId);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      productosEnVenta.push({
        id: productoId,
        nombre: productoNombre,
        cantidad,
        precio
      });
    }

    this.reset();
    $("#productoSelect").val(null).trigger("change");
    renderizarTablaVenta();
  });

  document.getElementById("btnRegistrarVenta").addEventListener("click", function () {
    if (productosEnVenta.length === 0) {
      return alert("Agregue al menos un producto.");
    }

    const payload = {
      fecha: new Date().toISOString().split("T")[0],
      ventaProductos: productosEnVenta.map(p => ({
        cantidad: p.cantidad,
        precioUnitario: p.precio,
        producto: { id_producto: parseInt(p.id) }
      }))
    };

    fetch(`${API_URL}/ventas/registrar`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al registrar venta");
        return res.text();
      })
      .then(() => {
        alert("Venta registrada correctamente.");
        productosEnVenta = [];
        renderizarTablaVenta();
        cargarProductos();
        cargarHistorialVentas();
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Ocurrió un error al registrar la venta.");
      });
  });

  function cargarHistorialVentas() {
    fetch(`${API_URL}/ventas/listar`, { headers })
      .then(res => res.json())
      .then(data => {
        const table = $("#tablaHistorialVentas").DataTable();
        table.clear();
        data.forEach(venta => {
          table.row.add([
            venta.id_venta,
            venta.fecha,
            `<button class="btn btn-info btn-sm" onclick="verDetalleVenta(${venta.id_venta})">Ver Detalle</button>`
          ]);
        });
        table.draw();
      })
      .catch(err => console.error("Error al cargar historial de ventas:", err));
  }

  window.verDetalleVenta = function (ventaId) {
    fetch(`${API_URL}/ventas/detalle/${ventaId}`, { headers })
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("detalleVentaBody");
        const totalSpan = document.getElementById("totalDetalleVenta");

        tbody.innerHTML = "";
        let total = 0;

        data.detalle.forEach(item => {
          const subtotal = item.precioUnitario * item.cantidad;
          total += subtotal;

          const row = `
            <tr>
              <td>${item.producto}</td>
              <td>${item.cantidad}</td>
              <td>${item.precioUnitario.toFixed(2)}</td>
              <td>${subtotal.toFixed(2)}</td>
            </tr>
          `;
          tbody.innerHTML += row;
        });

        totalSpan.textContent = total.toFixed(2);
        const modal = new bootstrap.Modal(document.getElementById("detalleVentaModal"));
        modal.show();
      })
      .catch(err => {
        console.error("Error al obtener detalle de venta:", err);
        alert("No se pudo obtener el detalle.");
      });
  };

  cargarProductos();
  $('#tablaHistorialVentas').DataTable();
  cargarHistorialVentas();
});
