document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8080/api";
    let productosEnCompra = [];
    let comprasTable;

    function inicializarDataTables() {
        comprasTable = $('#tablaCompras').DataTable({
            dom: '<"row"<"col-md-6"l><"col-md-6"f>>rt<"row"<"col-md-6"i><"col-md-6"p>>B',
            buttons: [
                {
                    extend: 'copy',
                    text: '<i class="bi bi-files"></i> Copiar',
                    className: 'btn btn-sm btn-outline-secondary'
                },
                {
                    extend: 'excel',
                    text: '<i class="bi bi-file-excel"></i> Excel',
                    className: 'btn btn-sm btn-outline-success'
                },
                {
                    extend: 'pdf',
                    text: '<i class="bi bi-file-pdf"></i> PDF',
                    className: 'btn btn-sm btn-outline-danger'
                },
                {
                    extend: 'print',
                    text: '<i class="bi bi-printer"></i> Imprimir',
                    className: 'btn btn-sm btn-outline-primary'
                }
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            responsive: true,
            columnDefs: [
                {
                    targets: -1,
                    orderable: false,
                    searchable: false,
                    className: 'action-buttons'
                }
            ]
        });
    }

    function authHeader() {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "../index.html";
            return {};
        }
        return {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };
    }

    function showAlert(type, message, duration = 5000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1100';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), duration);
    }

    function showConfirmModal(title, message, type, confirmCallback) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-${type} text-white">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-${type}" id="confirmActionBtn">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        modal.querySelector('#confirmActionBtn').addEventListener('click', () => {
            confirmCallback();
            bsModal.hide();
        });
    }

    function cargarProveedores() {
      fetch(`${API_URL}/proveedores/listar`, authHeader())
          .then(res => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return res.json();
          })
          .then(proveedores => {
              const select = document.getElementById("proveedorSelect");
              select.innerHTML = '<option value=""></option>';
              
              proveedores.forEach(p => {
                  const option = new Option(p.nombre, p.id_proveedor);
                  select.add(option);
              });

              $('#proveedorSelect').select2({
                  placeholder: "Seleccione un proveedor",
                  width: '100%',
                  dropdownParent: $('#nuevaCompraModal') 
              });
          })
          .catch(err => {
              console.error("Error al cargar proveedores:", err);
              showAlert('danger', 'Error al cargar proveedores');
              console.log("Respuesta del servidor:", err.response);
          });
    }

    function cargarProductos() {
      fetch(`${API_URL}/productos/listar`, authHeader())
          .then(res => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return res.json();
          })
          .then(productos => {
              const select = document.getElementById("productoSelect");
              select.innerHTML = '<option value=""></option>';
              
              productos.forEach(p => {
                  const option = new Option(p.nombre, p.id_producto);
                  select.add(option);
              });

              $('#productoSelect').select2({
                  placeholder: "Seleccione un producto",
                  width: '100%',
                  dropdownParent: $('#nuevaCompraModal') 
              });
          })
          .catch(err => {
              console.error("Error al cargar productos:", err);
              showAlert('danger', 'Error al cargar productos');
              console.log("Respuesta del servidor:", err.response);
          });
    }

    function agregarProductoACompra(e) {
      e.preventDefault();

      const proveedorId = document.getElementById("proveedorSelect").value;
      const proveedorNombre = document.getElementById("proveedorSelect").selectedOptions[0].text;
      const productoId = document.getElementById("productoSelect").value;
      const productoNombre = document.getElementById("productoSelect").selectedOptions[0].text;
      const cantidad = parseInt(document.getElementById("cantidad").value);
      const precio = parseFloat(document.getElementById("precio").value);

      if (!proveedorId || !productoId || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
          showAlert('warning', 'Complete todos los campos correctamente');
          return;
      }

      const productoExistente = productosEnCompra.find(item => 
          item.productoId === productoId && 
          item.proveedorId === proveedorId &&
          item.precio === precio
      );

      if (productoExistente) {
          productoExistente.cantidad += cantidad;
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
      document.getElementById("formAgregarProducto").reset();
      $("#productoSelect").val(null).trigger("change");
    }

    function renderizarTablaCompra() {
      const tbody = document.querySelector("#tablaCompra tbody");
      tbody.innerHTML = "";
      let total = 0;

      productosEnCompra.forEach((item, index) => {
          const subtotal = item.precio * item.cantidad;
          total += subtotal;

          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${item.productoNombre}</td>
              <td>${item.proveedorNombre}</td>
              <td class="text-center">${item.cantidad}</td>
              <td class="text-end">$${item.precio.toFixed(2)}</td>
              <td class="text-end">$${subtotal.toFixed(2)}</td>
              <td class="text-center">
                  <button class="btn btn-danger btn-sm" onclick="eliminarProductoCompra(${index})">
                      <i class="bi bi-trash"></i>
                  </button>
              </td>
          `;
          tbody.appendChild(row);
      });

      document.getElementById("totalCompra").textContent = total.toFixed(2);
  }

    window.eliminarProductoCompra = function(index) {
        productosEnCompra.splice(index, 1);
        renderizarTablaCompra();
    };

    function registrarCompra() {
        if (productosEnCompra.length === 0) {
            showAlert('warning', 'Agrega al menos un producto a la compra');
            return;
        }

        showConfirmModal(
            '¿Confirmar compra?',
            `¿Estás seguro de registrar esta compra con ${productosEnCompra.length} productos?`,
            'primary',
            () => {
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
                    ...authHeader(),
                    body: JSON.stringify(payload)
                })
                .then(res => {
                    if (!res.ok) throw new Error(res.statusText);
                    return res.json();
                })
                .then(() => {
                    showAlert('success', 'Compra registrada con éxito');
                    productosEnCompra = [];
                    renderizarTablaCompra();
                    cargarCompras();
                    $('#nuevaCompraModal').modal('hide');
                })
                .catch(err => {
                    console.error("Error al registrar compra:", err);
                    showAlert('danger', 'Error al registrar la compra');
                });
            }
        );
    }

    function cargarCompras() {
        fetch(`${API_URL}/compras/listar`, authHeader())
            .then(res => res.json())
            .then(compras => {
                comprasTable.clear();
                compras.forEach(c => {
                    comprasTable.row.add([
                        c.id,
                        c.fecha,
                        `$${c.total?.toFixed(2) || '0.00'}`,
                        `<button class="btn btn-info btn-sm" onclick="verDetalleCompra(${c.id})">
                            <i class="bi bi-eye"></i> Detalles
                        </button>`
                    ]);
                });
                comprasTable.draw();
            })
            .catch(err => {
                console.error("Error al cargar compras:", err);
                showAlert('danger', 'Error al cargar el historial de compras');
            });
    }

    window.verDetalleCompra = function(compraId) {
      fetch(`${API_URL}/compras/detalle/${compraId}`, authHeader())
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

                  const row = document.createElement("tr");
                  row.innerHTML = `
                      <td>${item.producto}</td>
                      <td>${item.proveedor}</td>
                      <td class="text-center">${item.cantidad}</td>
                      <td class="text-end">$${precio.toFixed(2)}</td>
                      <td class="text-end">$${subtotal.toFixed(2)}</td>
                  `;
                  tbody.appendChild(row);
              });

              totalSpan.textContent = total.toFixed(2);
              
              const btnFactura = document.getElementById("btnGenerarFactura");
              btnFactura.onclick = () => generarFacturaCompra({
                  id: compraId,
                  fecha: data.fecha || new Date().toISOString().split('T')[0],
                  detalle: data.detalle.map(item => ({
                      producto: item.producto,
                      proveedor: item.proveedor,
                      cantidad: item.cantidad,
                      precioUnitario: item.precioUnitario || 0,
                      subtotal: item.subtotal || 0
                  }))
              });
              
              const modal = new bootstrap.Modal(document.getElementById("detalleCompraModal"));
              modal.show();
          })
          .catch(error => {
              console.error("Error al cargar detalle de compra:", error);
              showAlert('danger', 'No se pudo cargar el detalle de la compra');
          });
  };

    function generarFacturaCompra(compraData) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURA DE COMPRA", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("GIMNASIO FITNESS", 105, 30, { align: "center" });
      doc.text("NIT: 123456789-0", 105, 35, { align: "center" });
      doc.text("Dirección: Calle 123 #45-67", 105, 40, { align: "center" });
      doc.text("Teléfono: (123) 456-7890", 105, 45, { align: "center" });
      
      doc.setDrawColor(200);
      doc.line(15, 50, 195, 50);
      
      doc.setFontSize(10);
      doc.text(`Factura No: COMP-${compraData.id}`, 15, 60);
      doc.text(`Fecha: ${compraData.fecha}`, 15, 65);
      doc.text(`Proveedor: ${compraData.detalle[0]?.proveedor || 'No especificado'}`, 15, 70);
      
      doc.autoTable({
          startY: 80,
          head: [['Producto', 'Proveedor', 'Cantidad', 'Precio Unitario', 'Subtotal']],
          body: compraData.detalle.map(item => [
              item.producto,
              item.proveedor,
              item.cantidad,
              `$${item.precioUnitario.toFixed(2)}`,
              `$${(item.precioUnitario * item.cantidad).toFixed(2)}`
          ]),
          styles: {
              fontSize: 8,
              cellPadding: 3,
              halign: 'right'
          },
          headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold'
          },
          columnStyles: {
              0: { halign: 'left', cellWidth: 50 },
              1: { halign: 'left', cellWidth: 40 },
              2: { halign: 'center', cellWidth: 20 }
          }
      });
      
      const total = compraData.detalle.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      doc.text(`Total: $${total.toFixed(2)}`, 160, doc.autoTable.previous.finalY + 10);
      
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Documento válido para contabilidad", 105, 280, { align: "center" });
      doc.text("Gracias por su servicio", 105, 285, { align: "center" });
      
      doc.save(`Factura_Compra_${compraData.id}.pdf`);
  }

    document.getElementById("formAgregarProducto").addEventListener("submit", agregarProductoACompra);
    document.getElementById("btnRegistrarCompra").addEventListener("click", registrarCompra);

    inicializarDataTables();
    cargarProveedores();
    cargarProductos();
    cargarCompras();
});