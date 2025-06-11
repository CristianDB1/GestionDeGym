document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:8080/api/clientes";
    let table = $('#clientesTable').DataTable({
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

    table.buttons().container()
        .appendTo($('.col-md-6:eq(0)', table.table().container()));

    function loadClientes() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }

        fetch(`${API_URL}/listar`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            table.clear();
            data.forEach(cliente => {
                table.row.add([
                    cliente.idCliente,
                    cliente.nombre,
                    cliente.apellido,
                    cliente.email,
                    cliente.telefono,
                    `<button class="btn btn-warning btn-sm editar-cliente" data-id="${cliente.idCliente}">
                        <i class="bi bi-pencil"></i> Editar
                     </button>
                     <button class="btn btn-danger btn-sm eliminar-cliente" data-id="${cliente.idCliente}">
                        <i class="bi bi-trash"></i> Eliminar
                     </button>`
                ]);
            });
            table.draw();
        })
        .catch(error => {
            console.error("Error al cargar clientes:", error);
            showAlert('danger', 'Error al cargar los clientes');
        });
    }

    function guardarCliente(event) {
        event.preventDefault();

        const formData = {
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            email: document.getElementById("email").value,
            telefono: document.getElementById("telefono").value
        };

        const id = document.getElementById("clienteId").value.trim();
        const action = id ? 'actualizar' : 'crear';

        showConfirmModal(
            `¿Estás seguro que deseas ${action} este cliente?`,
            `Cliente: ${formData.nombre} ${formData.apellido}`,
            'primary',
            () => {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No hay token disponible.");
                    return;
                }

                let method = id ? "PUT" : "POST";
                let url = id ? `${API_URL}/actualizar/${id}` : `${API_URL}/crear`;

                fetch(url, {
                    method: method,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                })
                .then(async response => {
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Error al guardar cliente. Status: ${response.status} - ${errorText}`);
                    }
                    return response.json();
                })
                .then(() => {
                    document.getElementById("clienteForm").reset();
                    document.getElementById("clienteId").value = "";
                    bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
                    loadClientes();
                    showAlert('success', `Cliente ${action === 'crear' ? 'creado' : 'actualizado'} correctamente`);
                })
                .catch(error => {
                    console.error("Error al guardar cliente:", error);
                    showAlert('danger', `Error al ${action} el cliente`);
                });
            }
        );
    }

    function editarCliente(id) {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }

        fetch(`${API_URL}/buscar/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(cliente => {
            document.getElementById("clienteId").value = cliente.idCliente;
            document.getElementById("nombre").value = cliente.nombre;
            document.getElementById("apellido").value = cliente.apellido;
            document.getElementById("email").value = cliente.email;
            document.getElementById("telefono").value = cliente.telefono;
            
            document.getElementById("clienteModalLabel").textContent = "Editar Cliente";
            const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
            modal.show();
        })
        .catch(error => {
            console.error("Error al obtener cliente:", error);
            showAlert('danger', 'Error al cargar los datos del cliente');
        });
    }

    function eliminarCliente(id) {
        fetch(`${API_URL}/buscar/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(cliente => {
            showConfirmModal(
                '¿Estás seguro que deseas eliminar este cliente?',
                `Cliente: ${cliente.nombre} ${cliente.apellido}<br>Esta acción no se puede deshacer.`,
                'danger',
                () => {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        console.error("No hay token disponible.");
                        return;
                    }
                    
                    fetch(`${API_URL}/eliminar/${id}`, { 
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error al eliminar cliente. Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(() => {
                        loadClientes();
                        showAlert('success', 'Cliente eliminado correctamente');
                    })
                    .catch(error => {
                        console.error("Error al eliminar cliente:", error);
                        showAlert('danger', 'Error al eliminar el cliente');
                    });
                }
            );
        })
        .catch(error => {
            console.error("Error al obtener cliente para eliminar:", error);
            showAlert('danger', 'Error al cargar los datos del cliente');
        });
    }

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

    function showConfirmModal(title, message, type, confirmCallback) {
        const modalId = 'dynamicConfirmModal';
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

    document.getElementById("clienteForm").addEventListener("submit", guardarCliente);

    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("editar-cliente") || 
            event.target.closest(".editar-cliente")) {
            const btn = event.target.classList.contains("editar-cliente") ? 
                event.target : event.target.closest(".editar-cliente");
            editarCliente(btn.dataset.id);
        } else if (event.target.classList.contains("eliminar-cliente") || 
                 event.target.closest(".eliminar-cliente")) {
            const btn = event.target.classList.contains("eliminar-cliente") ? 
                event.target : event.target.closest(".eliminar-cliente");
            eliminarCliente(btn.dataset.id);
        }
    });

    document.getElementById('clienteModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById("clienteForm").reset();
        document.getElementById("clienteId").value = "";
        document.getElementById("clienteModalLabel").textContent = "Agregar Nuevo Cliente";
    });

    loadClientes();
});