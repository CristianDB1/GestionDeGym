document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:8080/api";
    const DIAS_AVISO_VENCIMIENTO = 7;
    
    const table = $('#membresiasTable').DataTable({
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
                targets: 4,
                render: function(data, type, row) {
                    if (type === 'display') {
                        const fechaFin = new Date(row[3]);
                        const hoy = new Date();
                        const diffTime = fechaFin - hoy;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) {
                            return '<span class="badge estado-vencida">Vencida</span>';
                        } else if (diffDays <= DIAS_AVISO_VENCIMIENTO) {
                            return `<span class="badge estado-por-vencer">Por vencer (${diffDays}d)</span>`;
                        } else {
                            return '<span class="badge estado-activa">Activa</span>';
                        }
                    }
                    return data;
                }
            }
        ]
    });

    table.buttons().container()
        .appendTo($('.col-md-6:eq(0)', table.table().container()));

    function cargarClientes() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }

        fetch(`${API_URL}/clientes/listar`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(clientes => {
            const select = $('#clienteSelect');
            select.empty();
            select.append('<option value=""></option>');
            
            clientes.forEach(cliente => {
                select.append(new Option(
                    `${cliente.nombre} ${cliente.apellido} (${cliente.email})`, 
                    cliente.idCliente
                ));
            });
            
            select.select2({
                placeholder: "Buscar cliente...",
                allowClear: true,
                width: '100%'
            });
        })
        .catch(error => {
            console.error("Error al cargar clientes:", error);
            showAlert('danger', 'Error al cargar la lista de clientes');
        });
    }

    function cargarMembresias() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }

        fetch(`${API_URL}/membresias/listar`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(membresias => {
            const select = document.getElementById("membresiaSelect");
            select.innerHTML = '<option value="">Seleccione una membresía</option>';
            
            membresias.filter(m => m.activa).forEach(m => {
                const option = document.createElement("option");
                option.value = m.id_membresia;
                option.textContent = `${m.nombre} - ${new Intl.NumberFormat('es-CO', { 
                    style: 'currency', 
                    currency: 'COP' 
                }).format(m.precio)} (${m.duracionDias} días)`;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error al cargar membresías:", error);
            showAlert('danger', 'Error al cargar la lista de membresías');
        });
    }

    function cargarMembresiasAsignadas() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible.");
            return;
        }

        fetch(`${API_URL}/membresiasCliente/listar`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            table.clear();
            
            data.forEach(item => {
                table.row.add([
                    `${item.cliente.nombre} ${item.cliente.apellido}`,
                    item.membresia.nombre,
                    new Date(item.fechaInicio).toLocaleDateString(),
                    new Date(item.fechaFin).toLocaleDateString(),
                    item.activa ? "Activa" : "Vencida"
                ]);
            });
            
            table.draw();
            verificarMembresiasPorVencer(data);
        })
        .catch(error => {
            console.error("Error al cargar membresías asignadas:", error);
            showAlert('danger', 'Error al cargar las membresías asignadas');
        });
    }

    function verificarMembresiasPorVencer(membresias) {
        const hoy = new Date();
        const avisos = [];
        
        membresias.forEach(m => {
            if (m.activa) {
                const fechaFin = new Date(m.fechaFin);
                const diffTime = fechaFin - hoy;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= DIAS_AVISO_VENCIMIENTO && diffDays >= 0) {
                    avisos.push({
                        nombre: `${m.cliente.nombre} ${m.cliente.apellido}`,
                        dias: diffDays,
                        fechaFin: fechaFin.toLocaleDateString()
                    });
                }
            }
        });
        
        if (avisos.length > 0) {
            mostrarAvisosVencimiento(avisos);
        }
    }

    function mostrarAvisosVencimiento(avisos) {
        const modalId = 'avisosVencimientoModal';
        let modal = document.getElementById(modalId);
        
        if (modal) {
            modal.remove();
        }
        
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');
        
        let avisosHTML = '<ul class="list-group mb-3">';
        avisos.forEach(aviso => {
            avisosHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${aviso.nombre}</strong><br>
                        <small>Vence en ${aviso.dias} días (${aviso.fechaFin})</small>
                    </div>
                    <span class="badge bg-warning text-dark">Por vencer</span>
                </li>
            `;
        });
        avisosHTML += '</ul>';
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">Avisos de vencimiento</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Las siguientes membresías están por vencer en los próximos ${DIAS_AVISO_VENCIMIENTO} días:</p>
                        ${avisosHTML}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    function asignarMembresia(event) {
        event.preventDefault();
        
        const clienteId = document.getElementById("clienteSelect").value;
        const membresiaId = document.getElementById("membresiaSelect").value;
        
        if (!clienteId || !membresiaId) {
            showAlert('warning', 'Debe seleccionar un cliente y una membresía');
            return;
        }
        
        const clienteNombre = $('#clienteSelect option:selected').text().split(' (')[0];
        const membresiaNombre = $('#membresiaSelect option:selected').text().split(' - ')[0];
        
        showConfirmModal(
            '¿Confirmar asignación de membresía?',
            `Cliente: <strong>${clienteNombre}</strong><br>
             Membresía: <strong>${membresiaNombre}</strong>`,
            'primary',
            () => {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No hay token disponible.");
                    return;
                }
                
                fetch(`${API_URL}/membresiasCliente/asignar?clienteId=${clienteId}&membresiaId=${membresiaId}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                .then(async response => {
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Error al asignar membresía. Status: ${response.status} - ${errorText}`);
                    }
                    return response.json();
                })
                .then(() => {
                    $('#asignarMembresiaModal').modal('hide');
                    document.getElementById("asignarMembresiaForm").reset();
                    $('#clienteSelect').val(null).trigger('change');
                    
                    cargarMembresiasAsignadas();
                    showAlert('success', 'Membresía asignada correctamente');
                })
                .catch(error => {
                    console.error("Error al asignar membresía:", error);
                    showAlert('danger', 'Error al asignar la membresía');
                });
            }
        );
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

    document.getElementById("asignarMembresiaForm").addEventListener("submit", asignarMembresia);
    
    $('#asignarMembresiaModal').on('hidden.bs.modal', function () {
        document.getElementById("asignarMembresiaForm").reset();
        $('#clienteSelect').val(null).trigger('change');
    });

    cargarClientes();
    cargarMembresias();
    cargarMembresiasAsignadas();
});