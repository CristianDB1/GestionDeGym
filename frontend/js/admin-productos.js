document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8080/api/productos";
    let table = $('#productosTable').DataTable({
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
            },
            {
                extend: 'colvis',
                text: '<i class="bi bi-eye"></i> Columnas',
                className: 'btn btn-sm btn-outline-info'
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        responsive: true,
        columnDefs: [
            { targets: 3, className: 'text-end' }, 
            { targets: 4, className: 'text-center' }, 
            { 
                targets: -1, 
                orderable: false,
                searchable: false,
                className: 'action-buttons'
            }
        ]
    });

    function authHeader() {
        return {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        };
    }

    function showAlert(type, message, duration = 5000) {
        document.querySelectorAll('.custom-alert').forEach(el => el.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${getAlertIcon(type)} me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, duration);
    }

    function getAlertIcon(type) {
        const icons = {
            'success': 'bi-check-circle-fill',
            'danger': 'bi-exclamation-triangle-fill',
            'warning': 'bi-exclamation-circle-fill',
            'info': 'bi-info-circle-fill'
        };
        return icons[type] || 'bi-info-circle-fill';
    }

    function showConfirmModal(title, message, type, confirmCallback) {
        const modalId = 'confirmModal';
        let modal = document.getElementById(modalId);
        
        if (modal) modal.remove();
        
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
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
    }

    function cargarProductos() {
        fetch(`${API_URL}/listar`, authHeader())
            .then(response => response.json())
            .then(data => {
                table.clear();
                data.forEach(p => {
                    table.row.add([
                        p.id_producto,
                        p.nombre,
                        p.descripcion || 'N/A',
                        `$${p.precio.toLocaleString('es-CO')}`,
                        p.stock,
                        `
                        <button class="btn btn-warning btn-sm editar-producto" data-id="${p.id_producto}">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm eliminar-producto" data-id="${p.id_producto}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                        `
                    ]);
                });
                table.draw();
            })
            .catch(error => {
                console.error("Error al cargar productos:", error);
                showAlert('danger', 'Error al cargar productos');
            });
    }

    function guardarProducto(event) {
        event.preventDefault();
        
        const formData = {
            nombre: document.getElementById("productoNombre").value,
            descripcion: document.getElementById("productoDescripcion").value,
            precio: parseFloat(document.getElementById("productoPrecio").value),
            stock: parseInt(document.getElementById("productoStock").value)
        };

        const id = document.getElementById("productoId").value;
        const action = id ? 'actualizar' : 'crear';

        showConfirmModal(
            `¿Confirmar ${action} de producto?`,
            `Nombre: <strong>${formData.nombre}</strong><br>
             Precio: <strong>$${formData.precio.toLocaleString('es-CO')}</strong><br>
             Stock: <strong>${formData.stock}</strong>`,
            'primary',
            () => {
                const url = id ? `${API_URL}/actualizar/${id}` : `${API_URL}/crear`;
                const method = id ? "PUT" : "POST";

                fetch(url, {
                    method,
                    ...authHeader(),
                    body: JSON.stringify(formData)
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al guardar");
                    return response.json();
                })
                .then(() => {
                    $('#productoModal').modal('hide');
                    cargarProductos();
                    showAlert('success', `Producto ${action === 'crear' ? 'creado' : 'actualizado'} correctamente`);
                })
                .catch(error => {
                    console.error("Error:", error);
                    showAlert('danger', `Error al ${action} el producto`);
                });
            }
        );
    }

    function editarProducto(id) {
        fetch(`${API_URL}/buscar/${id}`, authHeader())
            .then(response => response.json())
            .then(producto => {
                document.getElementById("productoId").value = producto.id_producto;
                document.getElementById("productoNombre").value = producto.nombre;
                document.getElementById("productoDescripcion").value = producto.descripcion;
                document.getElementById("productoPrecio").value = producto.precio;
                document.getElementById("productoStock").value = producto.stock;
                
                document.getElementById("productoModalLabel").textContent = "Editar Producto";
                $('#productoModal').modal('show');
                
                showAlert('info', `Editando producto: ${producto.nombre}`);
            })
            .catch(error => {
                console.error("Error al cargar producto:", error);
                showAlert('danger', 'Error al cargar datos del producto');
            });
    }

    function eliminarProducto(id) {
        fetch(`${API_URL}/buscar/${id}`, authHeader())
            .then(response => response.json())
            .then(producto => {
                showConfirmModal(
                    '¿Confirmar eliminación?',
                    `¿Estás seguro de eliminar este producto?<br><br>
                     <strong>${producto.nombre}</strong><br>
                     Precio: $${producto.precio.toLocaleString('es-CO')}<br>
                     Stock: ${producto.stock}`,
                    'danger',
                    () => {
                        fetch(`${API_URL}/eliminar/${id}`, {
                            method: "DELETE",
                            ...authHeader()
                        })
                        .then(response => {
                            if (!response.ok) throw new Error("Error al eliminar");
                            cargarProductos();
                            showAlert('success', 'Producto eliminado correctamente');
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            showAlert('danger', 'Error al eliminar producto');
                        });
                    }
                );
            });
    }

    document.getElementById("productoForm").addEventListener("submit", guardarProducto);

    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("editar-producto") || e.target.closest(".editar-producto")) {
            const btn = e.target.classList.contains("editar-producto") ? 
                e.target : e.target.closest(".editar-producto");
            editarProducto(btn.dataset.id);
        }
        else if (e.target.classList.contains("eliminar-producto") || e.target.closest(".eliminar-producto")) {
            const btn = e.target.classList.contains("eliminar-producto") ? 
                e.target : e.target.closest(".eliminar-producto");
            eliminarProducto(btn.dataset.id);
        }
    });

    $('#productoModal').on('hidden.bs.modal', function () {
        document.getElementById("productoForm").reset();
        document.getElementById("productoId").value = "";
        document.getElementById("productoModalLabel").textContent = "Nuevo Producto";
    });

    
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "../index.html";
    else cargarProductos();
});