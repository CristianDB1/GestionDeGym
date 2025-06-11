document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8080/api/membresias";
    const token = localStorage.getItem("token");
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    let tablaMembresias;

    function initDataTable() {
        tablaMembresias = $('#tablaMembresias').DataTable({
            ajax: {
                url: API_URL + "/listar",
                headers: headers,
                dataSrc: ''
            },
            columns: [
                { data: "nombre" },
                { data: "duracionDias" },
                { 
                    data: "precio",
                    render: function(data) {
                        return `$${data.toLocaleString('es-CO')}`;
                    }
                },
                { 
                    data: "activa",
                    render: function(data) {
                        return data ? 
                            '<span class="badge bg-success">Activa</span>' : 
                            '<span class="badge bg-secondary">Inactiva</span>';
                    }
                },
                {
                    data: "id_membresia",
                    render: function(data, type, row) {
                        return `
                            <button class="btn btn-sm btn-warning me-1" onclick="editarMembresia(${data})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarMembresia(${data})">
                                <i class="bi bi-trash"></i>
                            </button>
                        `;
                    }
                }
            ]
        });
    }

    document.getElementById("btnGuardarMembresia").addEventListener("click", function() {
        const membresiaId = document.getElementById("membresiaId").value;
        const method = membresiaId ? "PUT" : "POST";
        const url = membresiaId ? `${API_URL}/actualizar/${membresiaId}` : `${API_URL}/crear`;

        const membresiaData = {
            nombre: document.getElementById("nombreMembresia").value,
            duracionDias: parseInt(document.getElementById("duracionMembresia").value),
            precio: parseFloat(document.getElementById("precioMembresia").value),
            activa: document.getElementById("activaMembresia").checked
        };

        fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(membresiaData)
        })
        .then(response => response.json())
        .then(data => {
            $('#membresiaModal').modal('hide');
            tablaMembresias.ajax.reload();
            showAlert('success', 'Membresía guardada correctamente');
        })
        .catch(error => {
            console.error("Error:", error);
            showAlert('danger', 'Error al guardar la membresía');
        });
    });

    $('#membresiaModal').on('hidden.bs.modal', function () {
        document.getElementById("formMembresia").reset();
        document.getElementById("membresiaId").value = "";
    });

    window.editarMembresia = function(id) {
        fetch(`${API_URL}/buscar/${id}`, { headers })
            .then(response => response.json())
            .then(data => {
                document.getElementById("membresiaId").value = data.id_membresia;
                document.getElementById("nombreMembresia").value = data.nombre;
                document.getElementById("duracionMembresia").value = data.duracionDias;
                document.getElementById("precioMembresia").value = data.precio;
                document.getElementById("activaMembresia").checked = data.activa;
                
                document.getElementById("membresiaModalLabel").textContent = "Editar Membresía";
                $('#membresiaModal').modal('show');
            });
    };

    window.eliminarMembresia = function(id) {
        if (confirm("¿Está seguro de eliminar esta membresía?")) {
            fetch(`${API_URL}/eliminar/${id}`, {
                method: "DELETE",
                headers: headers
            })
            .then(response => {
                if (response.ok) {
                    tablaMembresias.ajax.reload();
                    showAlert('success', 'Membresía eliminada correctamente');
                }
            });
        }
    };

    function showAlert(type, message) {
    }

    initDataTable();
});