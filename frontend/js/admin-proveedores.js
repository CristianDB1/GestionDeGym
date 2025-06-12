document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8080/api/proveedores";
    let table = $('#proveedoresTable').DataTable({
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
        fetch(`${API_URL}/listar`, authHeader())
            .then(response => response.json())
            .then(data => {
                table.clear();
                data.forEach(p => {
                    table.row.add([
                        p.id_proveedor,
                        p.nombre,
                        p.telefono || 'N/A',
                        p.direccion || 'N/A',
                        `
                        <button class="btn btn-warning btn-sm editar-proveedor" data-id="${p.id_proveedor}">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm eliminar-proveedor" data-id="${p.id_proveedor}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                        `
                    ]);
                });
                table.draw();
            })
            .catch(error => {
                console.error("Error al cargar proveedores:", error);
                showAlert('danger', 'Error al cargar proveedores');
            });
    }

    function guardarProveedor(event) {
        event.preventDefault();
        
        const formData = {
            nombre: document.getElementById("proveedorNombre").value,
            telefono: document.getElementById("proveedorTelefono").value,
            direccion: document.getElementById("proveedorDireccion").value
        };

        const id = document.getElementById("proveedorId").value;
        const action = id ? 'actualizar' : 'crear';

        showConfirmModal(
            `¿Confirmar ${action} de proveedor?`,
            `Nombre: <strong>${formData.nombre}</strong><br>
             Teléfono: <strong>${formData.telefono || 'N/A'}</strong><br>
             Dirección: <strong>${formData.direccion || 'N/A'}</strong>`,
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
                    $('#proveedorModal').modal('hide');
                    cargarProveedores();
                    showAlert('success', `Proveedor ${action === 'crear' ? 'creado' : 'actualizado'} correctamente`);
                })
                .catch(error => {
                    console.error("Error:", error);
                    showAlert('danger', `Error al ${action} el proveedor`);
                });
            }
        );
    }

    function editarProveedor(id) {
        fetch(`${API_URL}/buscar/${id}`, authHeader())
            .then(response => response.json())
            .then(proveedor => {
                document.getElementById("proveedorId").value = proveedor.id_proveedor;
                document.getElementById("proveedorNombre").value = proveedor.nombre;
                document.getElementById("proveedorTelefono").value = proveedor.telefono;
                document.getElementById("proveedorDireccion").value = proveedor.direccion;
                
                document.getElementById("proveedorModalLabel").textContent = "Editar Proveedor";
                $('#proveedorModal').modal('show');
                
                showAlert('info', `Editando proveedor: ${proveedor.nombre}`);
            })
            .catch(error => {
                console.error("Error al cargar proveedor:", error);
                showAlert('danger', 'Error al cargar datos del proveedor');
            });
    }

    function eliminarProveedor(id) {
        fetch(`${API_URL}/buscar/${id}`, authHeader())
            .then(response => response.json())
            .then(proveedor => {
                showConfirmModal(
                    '¿Confirmar eliminación?',
                    `¿Estás seguro de eliminar este proveedor?<br><br>
                     <strong>${proveedor.nombre}</strong><br>
                     Teléfono: ${proveedor.telefono || 'N/A'}<br>
                     Dirección: ${proveedor.direccion || 'N/A'}`,
                    'danger',
                    () => {
                        fetch(`${API_URL}/eliminar/${id}`, {
                            method: "DELETE",
                            ...authHeader()
                        })
                        .then(response => {
                            if (!response.ok) throw new Error("Error al eliminar");
                            cargarProveedores();
                            showAlert('success', 'Proveedor eliminado correctamente');
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            showAlert('danger', 'Error al eliminar proveedor');
                        });
                    }
                );
            });
    }

    document.getElementById("proveedorForm").addEventListener("submit", guardarProveedor);

    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("editar-proveedor") || e.target.closest(".editar-proveedor")) {
            const btn = e.target.classList.contains("editar-proveedor") ? 
                e.target : e.target.closest(".editar-proveedor");
            editarProveedor(btn.dataset.id);
        }
        else if (e.target.classList.contains("eliminar-proveedor") || e.target.closest(".eliminar-proveedor")) {
            const btn = e.target.classList.contains("eliminar-proveedor") ? 
                e.target : e.target.closest(".eliminar-proveedor");
            eliminarProveedor(btn.dataset.id);
        }
    });

    $('#proveedorModal').on('hidden.bs.modal', function () {
        document.getElementById("proveedorForm").reset();
        document.getElementById("proveedorId").value = "";
        document.getElementById("proveedorModalLabel").textContent = "Nuevo Proveedor";
    });

    const token = localStorage.getItem("token");
    if (!token) window.location.href = "../index.html";
    else cargarProveedores();
});