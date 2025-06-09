document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;
    const API_URL = "http://localhost:8080/api";
    const token = localStorage.getItem("token");
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    let productosEnVenta = [];
    let ventaActual = null;

    // Inicializar DataTables
    const tablaHistorial = $('#tablaHistorialVentas').DataTable({
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
                className: 'text-center'
            }
        ]
    });

    // Añadir los botones al DOM
    tablaHistorial.buttons().container()
        .appendTo($('.col-md-6:eq(0)', tablaHistorial.table().container()));

    // Cargar productos disponibles
    function cargarProductos() {
        fetch(`${API_URL}/productos/listar`, { headers })
            .then(res => res.json())
            .then(productos => {
                const select = $('#productoSelect');
                select.empty();
                select.append('<option value=""></option>');
                
                productos.forEach(p => {
                    select.append(new Option(
                        `${p.nombre} (Stock: ${p.stock})`, 
                        p.id_producto,
                        false,
                        false,
                        { 'data-stock': p.stock, 'data-precio': p.precio }
                    ));
                });
                
                select.select2({
                    placeholder: "Buscar producto...",
                    allowClear: true,
                    width: '100%',
                    dropdownParent: $('#mainContent')
                });
            })
            .catch(error => {
                console.error("Error al cargar productos:", error);
                showAlert('danger', 'Error al cargar la lista de productos');
            });
    }

    // Actualizar precio cuando se selecciona un producto
    $('#productoSelect').on('change', function() {
        const precioBase = $(this).find(':selected').data('precio');
        if (precioBase) {
            $('#precio').val(precioBase.toFixed(2));
        }
    });

    // Renderizar tabla de productos en venta
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
                    <td>$${item.precio.toFixed(2)}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });

        document.getElementById("totalVenta").textContent = totalVenta.toFixed(2);
    }

    // Función global para eliminar productos
    window.eliminarProducto = function(index) {
        productosEnVenta.splice(index, 1);
        renderizarTablaVenta();
    };

    // Agregar producto a la venta
    document.getElementById("formAgregarVenta").addEventListener("submit", function(e) {
        e.preventDefault();

        const select = document.getElementById("productoSelect");
        const productoId = select.value;
        const productoNombre = select.options[select.selectedIndex].text.split(' (')[0];
        const stock = parseInt(select.options[select.selectedIndex].dataset.stock);
        const cantidad = parseInt(document.getElementById("cantidad").value);
        const precio = parseFloat(document.getElementById("precio").value);

        // Validaciones
        if (!productoId) {
            showAlert('warning', 'Seleccione un producto');
            return;
        }

        if (isNaN(cantidad)) {
            showAlert('warning', 'Ingrese una cantidad válida');
            return;
        }

        if (cantidad <= 0) {
            showAlert('warning', 'La cantidad debe ser mayor a cero');
            return;
        }

        if (cantidad > stock) {
            showAlert('warning', `La cantidad no puede superar el stock disponible (${stock})`);
            return;
        }

        if (isNaN(precio) || precio < 0) {
            showAlert('warning', 'Ingrese un precio válido');
            return;
        }

        // Agregar o actualizar producto
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

        // Resetear formulario
        this.reset();
        $("#productoSelect").val(null).trigger("change");
        renderizarTablaVenta();
    });

    // Cancelar venta
    document.getElementById("btnCancelarVenta").addEventListener("click", function() {
        if (productosEnVenta.length === 0) return;
        
        showConfirmModal(
            '¿Cancelar venta?',
            'Se eliminarán todos los productos agregados',
            'danger',
            () => {
                productosEnVenta = [];
                renderizarTablaVenta();
                showAlert('success', 'Venta cancelada correctamente');
            }
        );
    });

    // Registrar venta
    document.getElementById("btnRegistrarVenta").addEventListener("click", function() {
        if (productosEnVenta.length === 0) {
            showAlert('warning', 'Agregue al menos un producto');
            return;
        }

        showConfirmModal(
            '¿Registrar venta?',
            `Total: $${document.getElementById("totalVenta").textContent} COP`,
            'primary',
            registrarVenta
        );
    });

    function registrarVenta() {
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
            .then(async res => {
                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error || "Error al registrar venta");
                }
                return res.json();
            })
            .then(data => {
                showAlert('success', 'Venta registrada correctamente');
                productosEnVenta = [];
                renderizarTablaVenta();
                cargarProductos();
                cargarHistorialVentas();
                ventaActual = data; // Guardar datos de la venta actual
            })
            .catch(err => {
                console.error("Error:", err);
                showAlert('danger', err.message || 'Ocurrió un error al registrar la venta');
            });
    }

    // Cargar historial de ventas
    function cargarHistorialVentas() {
        fetch(`${API_URL}/ventas/listar`, { headers })
            .then(res => res.json())
            .then(data => {
                tablaHistorial.clear();
                data.forEach(venta => {
                    tablaHistorial.row.add([
                        venta.id_venta,
                        new Date(venta.fecha).toLocaleDateString(),
                        `<button class="btn btn-info btn-sm" onclick="verDetalleVenta(${venta.id_venta})">
                            <i class="bi bi-eye"></i> Detalle
                        </button>`
                    ]);
                });
                tablaHistorial.draw();
            })
            .catch(err => {
                console.error("Error al cargar historial de ventas:", err);
                showAlert('danger', 'Error al cargar el historial de ventas');
            });
    }

    // Ver detalle de venta
    window.verDetalleVenta = function(ventaId) {
        fetch(`${API_URL}/ventas/detalle/${ventaId}`, { headers })
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById("detalleVentaBody");
                const totalSpan = document.getElementById("totalDetalleVenta");
                const ventaIdHeader = document.getElementById("ventaIdHeader");
                const ventaFecha = document.getElementById("ventaFecha");

                // Actualizar información de la venta
                ventaIdHeader.textContent = data.id_venta;
                ventaFecha.textContent = new Date(data.fecha).toLocaleDateString();

                // Limpiar y llenar tabla de detalles
                tbody.innerHTML = "";
                let total = 0;

                data.detalle.forEach(item => {
                    const subtotal = item.precioUnitario * item.cantidad;
                    total += subtotal;

                    const row = `
                        <tr>
                            <td>${item.producto}</td>
                            <td>${item.cantidad}</td>
                            <td>$${item.precioUnitario.toFixed(2)}</td>
                            <td>$${subtotal.toFixed(2)}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });

                totalSpan.textContent = total.toFixed(2);
                ventaActual = data; // Guardar datos para generar factura

                // Mostrar modal
                const modal = new bootstrap.Modal(document.getElementById("detalleVentaModal"));
                modal.show();
            })
            .catch(err => {
                console.error("Error al obtener detalle de venta:", err);
                showAlert('danger', 'No se pudo obtener el detalle de la venta');
            });
    };

    // Generar factura en PDF
    document.getElementById("btnGenerarFactura").addEventListener("click", function() {
        if (!ventaActual) return;
        
        const doc = new jsPDF();
        
        // Configuración inicial
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text("FACTURA", 105, 20, { align: "center" });
        
        // Información del gimnasio
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("GIMNASIO FITNESS", 105, 30, { align: "center" });
        doc.text("NIT: 123456789-0", 105, 35, { align: "center" });
        doc.text("Dirección: Calle 123 #45-67", 105, 40, { align: "center" });
        doc.text("Teléfono: (123) 456-7890", 105, 45, { align: "center" });
        
        // Línea separadora
        doc.setDrawColor(200);
        doc.line(15, 50, 195, 50);
        
        // Información de la factura
        doc.setFontSize(10);
        doc.text(`Factura No: ${ventaActual.id_venta}`, 15, 60);
        doc.text(`Fecha: ${new Date(ventaActual.fecha).toLocaleDateString()}`, 15, 65);
        
        // Tabla de productos
        doc.autoTable({
            startY: 75,
            head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
            body: ventaActual.detalle.map(item => [
                item.producto,
                item.cantidad,
                `$${item.precioUnitario.toFixed(2)}`,
                `$${(item.precioUnitario * item.cantidad).toFixed(2)}`
            ]),
            styles: {
                fontSize: 9,
                cellPadding: 3,
                halign: 'right'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'center' }
            }
        });
        
        // Total
        const total = ventaActual.detalle.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
        doc.text(`Total: $${total.toFixed(2)}`, 160, doc.autoTable.previous.finalY + 10);
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("¡Gracias por su compra!", 105, 280, { align: "center" });
        doc.text("Este documento es una factura electrónica válida", 105, 285, { align: "center" });
        
        // Guardar o abrir PDF
        doc.save(`Factura_${ventaActual.id_venta}.pdf`);
    });

    // Función para mostrar alertas
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1100';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }

    // Función para mostrar modales de confirmación
    function showConfirmModal(title, message, type, confirmCallback) {
        const modalId = 'confirmModal';
        let modal = document.getElementById(modalId);
        
        if (modal) {
            modal.remove();
        }
        
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');
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
        
        modal.querySelector('#confirmActionBtn').addEventListener('click', function() {
            confirmCallback();
            bsModal.hide();
        });
        
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    }

    // Inicializar
    cargarProductos();
    cargarHistorialVentas();
});