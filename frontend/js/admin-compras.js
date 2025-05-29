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
      .then(proveedores => {
        const select = document.getElementById("proveedorSelect");
        select.innerHTML = "<option value=''>Seleccione proveedor</option>";
        proveedores.forEach(p => {
          const option = document.createElement("option");
          option.value = p.id_proveedor;
          option.textContent = p.nombre;
          select.appendChild(option);
        });
        $("#proveedorSelect").select2({ placeholder: "Buscar proveedor..." });
      })
      .catch(err => console.error("Error al cargar proveedores:", err));
  }

  function cargarProductos() {
    fetch(`${API_URL}/productos/listar`, { headers })
      .then(res => res.json())
      .then(productos => {
        const select = document.getElementById("productoSelect");
        select.innerHTML = "<option value=''>Seleccione producto</option>";
        productos.forEach(p => {
          const option = document.createElement("option");
          option.value = p.id_producto;
          option.textContent = p.nombre;
          select.appendChild(option);
        });
        $("#productoSelect").select2({ placeholder: "Buscar producto..." });
      })
      .catch(err => console.error("Error al cargar productos:", err));
  }

  document.getElementById("formAgregarProducto").addEventListener("submit", function (e) {
    e.preventDefault();

    const proveedorId = document.getElementById("proveedorSelect").value;
    const proveedorNombre = document.getElementById("proveedorSelect").selectedOptions[0].text;
    const productoId = document.getElementById("productoSelect").value;
    const productoNombre = document.getElementById("productoSelect").selectedOptions[0].text;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio").value);

    if (!proveedorId || !productoId || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
      alert("Complete todos los campos correctamente.");
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

  
  function renderizarTablaCompra() {
    const tbody = document.querySelector("#tablaCompra tbody");
    tbody.innerHTML = "";
    let total = 0;

    productosEnCompra.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;

      tbody.innerHTML += `
        <tr>
          <td>${item.productoNombre}</td>
          <td>${item.proveedorNombre}</td>
          <td>${item.cantidad}</td>
          <td>${item.precio.toFixed(2)}</td>
          <td>${subtotal.toFixed(2)}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="eliminarFila(${index})">Eliminar</button>
          </td>
        </tr>
      `;
    });

    document.getElementById("totalCompra").textContent = total.toFixed(2);
  }

  window.eliminarFila = function (index) {
    productosEnCompra.splice(index, 1);
    renderizarTablaCompra();
  };

  document.getElementById("btnRegistrarCompra").addEventListener("click", function () {
    if (productosEnCompra.length === 0) {
      alert("Agrega al menos un producto.");
      return;
    }

    const payload = {
      fecha: new Date().toISOString().split("T")[0],
      compraProductos: productosEnCompra.map(item => ({
        cantidad: item.cantidad,
        precioCompra: item.precio,
        producto: { id_producto: parseInt(item.productoId) },
        proveedor: { id_proveedor: parseInt(item.proveedorId) }
      }))
    };

    fetch(`${API_URL}/compras/registrar`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al registrar la compra");
        return res.json();
      })
      .then(() => {
        alert("Compra registrada con éxito");
        productosEnCompra = [];
        renderizarTablaCompra();
        cargarCompras();
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Ocurrió un error al registrar la compra.");
      });
  });

  window.verDetalleCompra = function (compraId) {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:8080/api/compras/detalle/${compraId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("detalleCompraBody");
      const totalSpan = document.getElementById("totalDetalleCompra");

      tbody.innerHTML = "";
      let total = 0;

      data.detalle.forEach(item => {
        const subtotal = item.subtotal ?? 0;
        const precio = item.precioUnitario ?? 0;
        total += subtotal;

        const row = `
          <tr>
            <td>${item.producto}</td>
            <td>${item.proveedor}</td>
            <td>${item.cantidad}</td>
            <td>${precio.toFixed(2)}</td>
            <td>${subtotal.toFixed(2)}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      totalSpan.textContent = total.toFixed(2);
      const modal = new bootstrap.Modal(document.getElementById("detalleCompraModal"));
      modal.show();
    })
    .catch(error => {
      console.error("Error al cargar detalle de compra:", error);
      alert("No se pudo cargar el detalle de la compra.");
    });
}

  function cargarCompras() {
    fetch(`${API_URL}/compras/listar`, { headers })
      .then(res => res.json())
      .then(compras => {
        const table = $("#tablaCompras").DataTable();
        table.clear();

        compras.forEach(c => {
          table.row.add([
            c.id,
            c.fecha,
            `<button class="btn btn-info btn-sm" onclick="verDetalleCompra(${c.id})">Ver Detalles</button>`
          ]);
        });

        table.draw();
      });
  }

  $('#tablaCompras').DataTable();
  cargarProveedores();
  cargarProductos();
  cargarCompras();
});
