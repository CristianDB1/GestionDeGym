document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8080/api/membresias";
    let table = $('#membresiasTable').DataTable({
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
                targets: [1], 
                className: 'text-end'
            },
            {
                targets: [2], 
                className: 'text-center'
            },
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

    table.buttons().container()
        .appendTo($('.col-md-6:eq(0)', table.table().container()));

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


    function cargarMembresias() {
        fetch(`${API_URL}/listar`, authHeader())
            .then(response => response.json())
            .then(data => {
                table.clear();
                data.forEach(m => {
                    table.row.add([
                        m.nombre,
                        `$${m.precio.toLocaleString('es-CO')}`,
                        `${m.duracionDias} días`,
                        m.activa ? 
                            '<span class="badge bg-success">Activa</span>' : 
                            '<span class="badge bg-danger">Inactiva</span>',
                        `<button class="btn btn-warning btn-sm editar-membresia" data-id="${m.id_membresia}">
                            <i class="bi bi-pencil"></i> Editar
                         </button>
                         <button class="btn btn-danger btn-sm eliminar-membresia" data-id="${m.id_membresia}">
                            <i class="bi bi-trash"></i> Eliminar
                         </button>`
                    ]);
                });
                table.draw();
            });
    }

    function guardarMembresia() {
      const formData = {
          nombre: document.getElementById("nombreMembresia").value,
          precio: parseFloat(document.getElementById("precioMembresia").value),
          duracionDias: parseInt(document.getElementById("duracionMembresia").value),
          activa: true
      };

      const id = document.getElementById("membresiaId").value;
      const action = id ? 'actualizar' : 'crear';

      showConfirmModal(
          `¿Confirmar ${action} de membresía?`,
          `Nombre: <strong>${formData.nombre}</strong><br>
          Precio: <strong>$${formData.precio.toLocaleString('es-CO')}</strong><br>
          Duración: <strong>${formData.duracionDias} días</strong>`,
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
                  $('#membresiaModal').modal('hide');
                  cargarMembresias();
                  showAlert('success', `Membresía ${action === 'crear' ? 'creada' : 'actualizada'} correctamente`);
              })
              .catch(error => {
                  console.error("Error:", error);
                  showAlert('danger', `Error al ${action} la membresía`);
              });
          }
      );
  }

    function editarMembresia(id) {
      fetch(`${API_URL}/buscar/${id}`, authHeader())
          .then(response => response.json())
          .then(membresia => {
              document.getElementById("membresiaId").value = membresia.id_membresia;
              document.getElementById("nombreMembresia").value = membresia.nombre;
              document.getElementById("precioMembresia").value = membresia.precio;
              document.getElementById("duracionMembresia").value = membresia.duracionDias;
              
              document.getElementById("membresiaModalLabel").textContent = "Editar Membresía";
              $('#membresiaModal').modal('show');
              
              showAlert('info', `Editando membresía: ${membresia.nombre}`);
          });
  }

    function eliminarMembresia(id) {
      fetch(`${API_URL}/buscar/${id}`, authHeader())
          .then(response => response.json())
          .then(membresia => {
              showConfirmModal(
                  '¿Confirmar eliminación?',
                  `¿Estás seguro de eliminar la membresía?<br><br>
                  <strong>${membresia.nombre}</strong><br>
                  Precio: $${membresia.precio.toLocaleString('es-CO')}<br>
                  Duración: ${membresia.duracionDias} días`,
                  'danger',
                  () => {
                      fetch(`${API_URL}/eliminar/${id}`, {
                          method: "DELETE",
                          ...authHeader()
                      })
                      .then(response => {
                          if (!response.ok) throw new Error("Error al eliminar");
                          cargarMembresias();
                          showAlert('success', 'Membresía eliminada correctamente');
                      })
                      .catch(error => {
                          console.error("Error:", error);
                          showAlert('danger', 'Error al eliminar membresía');
                      });
                  }
              );
          });
  }

    document.getElementById("guardarMembresia").addEventListener("click", guardarMembresia);

    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("editar-membresia") || e.target.closest(".editar-membresia")) {
            const btn = e.target.classList.contains("editar-membresia") ? 
                e.target : e.target.closest(".editar-membresia");
            editarMembresia(btn.dataset.id);
        }
        else if (e.target.classList.contains("eliminar-membresia") || e.target.closest(".eliminar-membresia")) {
            const btn = e.target.classList.contains("eliminar-membresia") ? 
                e.target : e.target.closest(".eliminar-membresia");
            eliminarMembresia(btn.dataset.id);
        }
    });

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

    $('#membresiaModal').on('hidden.bs.modal', function () {
        document.getElementById("membresiaForm").reset();
        document.getElementById("membresiaId").value = "";
        document.getElementById("membresiaModalLabel").textContent = "Nueva Membresía";
    });

    const token = localStorage.getItem("token");
    if (!token) window.location.href = "../index.html";
    else cargarMembresias();
});