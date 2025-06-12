document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:8080/api/usuarios";
    const table = $('#recepcionistasTable').DataTable({
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

    function cargarRecepcionistas() {
        fetch(`${API_URL}/listar`, authHeader())
            .then(res => res.json())
            .then(data => {
                table.clear();
                data
                    .filter(usuario => usuario.rol.nombre === "RECEPCIONISTA")
                    .forEach(usuario => {
                        table.row.add([
                            usuario.id_usuario,
                            usuario.nombre,
                            usuario.apellido,
                            usuario.username,
                            usuario.rol.nombre,
                            `
                            <button class="btn btn-warning btn-sm editar-btn" data-id="${usuario.id_usuario}">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm eliminar-btn" data-id="${usuario.id_usuario}">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                            `
                        ]);
                    });
                table.draw();
            })
            .catch(err => {
                console.error("Error al cargar recepcionistas:", err);
                showAlert('danger', 'Error al cargar la lista de recepcionistas');
            });
    }

    function limpiarFormulario() {
        document.getElementById("recepcionistaForm").reset();
        document.getElementById("recepcionistaId").value = "";
    }

    function abrirModalCrear() {
        limpiarFormulario();
        document.getElementById("modalTitle").textContent = "Nuevo Recepcionista";
        document.getElementById("guardarBtn").textContent = "Registrar";
        $("#recepcionistaModal").modal("show");
    }

    function cargarRecepcionistaEnFormulario(id) {
        fetch(`${API_URL}/buscar/${id}`, authHeader())
            .then(res => res.json())
            .then(usuario => {
                document.getElementById("recepcionistaId").value = usuario.id_usuario;
                document.getElementById("userNombre").value = usuario.nombre;
                document.getElementById("userApellido").value = usuario.apellido;
                document.getElementById("userUsername").value = usuario.username;
                document.getElementById("userPassword").value = "";

                document.getElementById("modalTitle").textContent = "Editar Recepcionista";
                document.getElementById("guardarBtn").textContent = "Actualizar";
                $("#recepcionistaModal").modal("show");
            })
            .catch(err => {
                console.error("Error al cargar recepcionista:", err);
                showAlert('danger', 'Error al cargar los datos del recepcionista');
            });
    }

    function crearRecepcionista(data) {
        return fetch(`${API_URL}/crear`, {
            method: "POST",
            ...authHeader(),
            body: JSON.stringify({ ...data, rol_id: 2 }) // Rol RECEPCIONISTA fijo
        })
        .then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }

    function actualizarRecepcionista(id, data) {
        return fetch(`${API_URL}/actualizar/${id}`, {
            method: "PUT",
            ...authHeader(),
            body: JSON.stringify(data)
        })
        .then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }

    function eliminarRecepcionista(id) {
        showConfirmModal(
            '¿Eliminar recepcionista?',
            'Esta acción no se puede deshacer. ¿Estás seguro?',
            'danger',
            () => {
                fetch(`${API_URL}/eliminar/${id}`, {
                    method: "DELETE",
                    ...authHeader()
                })
                .then(res => {
                    if (!res.ok) throw new Error(res.statusText);
                    showAlert('success', 'Recepcionista eliminado correctamente');
                    cargarRecepcionistas();
                })
                .catch(err => {
                    console.error("Error al eliminar recepcionista:", err);
                    showAlert('danger', 'Error al eliminar el recepcionista');
                });
            }
        );
    }

    function guardarRecepcionista(event) {
        event.preventDefault();

        const id = document.getElementById("recepcionistaId").value;
        const data = {
            nombre: document.getElementById("userNombre").value,
            apellido: document.getElementById("userApellido").value,
            username: document.getElementById("userUsername").value,
            password: document.getElementById("userPassword").value
        };

        const accion = id 
            ? actualizarRecepcionista(id, data)
            : crearRecepcionista(data);

        accion
            .then(() => {
                showAlert('success', id ? 'Recepcionista actualizado' : 'Recepcionista creado');
                $("#recepcionistaModal").modal("hide");
                limpiarFormulario();
                cargarRecepcionistas();
            })
            .catch(err => {
                console.error("Error al guardar recepcionista:", err);
                showAlert('danger', err.message || 'Error al guardar el recepcionista');
            });
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

    document.getElementById("nuevoBtn").addEventListener("click", abrirModalCrear);
    document.getElementById("recepcionistaForm").addEventListener("submit", guardarRecepcionista);

    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("editar-btn") || e.target.closest(".editar-btn")) {
            const btn = e.target.classList.contains("editar-btn") ? e.target : e.target.closest(".editar-btn");
            cargarRecepcionistaEnFormulario(btn.dataset.id);
        }
        
        if (e.target.classList.contains("eliminar-btn") || e.target.closest(".eliminar-btn")) {
            const btn = e.target.classList.contains("eliminar-btn") ? e.target : e.target.closest(".eliminar-btn");
            eliminarRecepcionista(btn.dataset.id);
        }
    });

    cargarRecepcionistas();
});