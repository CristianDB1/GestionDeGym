document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:8080/api/usuarios";
  const table = new DataTable("#recepcionistasTable");

  function authHeader() {
    return {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    };
  }

  function cargarRecepcionistas() {
    fetch(`${API_URL}/listar`, { headers: authHeader() })
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
              <button class="btn btn-warning btn-sm editar-btn" data-id="${usuario.id_usuario}">Editar</button>
              <button class="btn btn-danger btn-sm eliminar-btn" data-id="${usuario.id_usuario}">Eliminar</button>
              `
            ]);
          });
        table.draw();
      })
      .catch(err => {
        console.error("Error al cargar recepcionistas:", err);
      });
  }

  function limpiarFormulario() {
    document.getElementById("recepcionistaForm").reset();
    document.getElementById("recepcionistaId").value = "";
  }

  function abrirModalCrear() {
    limpiarFormulario();
    document.getElementById("modalTitle").textContent = "Crear Recepcionista";
    document.getElementById("guardarBtn").textContent = "Registrar";
    $("#recepcionistaModal").modal("show");
  }

  async function crearRecepcionista(data) {
    const response = await fetch(`${API_URL}/crear`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ ...data, rol_id: 2 }) 
    });

    if (!response.ok) throw new Error("Error al crear recepcionista");
    return response.json();
  }

  async function actualizarRecepcionista(id, data) {
    const response = await fetch(`${API_URL}/actualizar/${id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Error al actualizar recepcionista");
    return response.json();
  }

  function guardarRecepcionista(event) {
    event.preventDefault();

    const id = document.getElementById("recepcionistaId").value.trim();
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
        $("#recepcionistaModal").modal("hide");
        limpiarFormulario();
        cargarRecepcionistas();
      })
      .catch(error => {
        console.error("Error en operación:", error);
        alert("Ocurrió un error al guardar el recepcionista");
      });
  }

  function cargarRecepcionistaEnFormulario(id) {
    fetch(`${API_URL}/buscar/${id}`, { headers: authHeader() })
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
      .catch(err => console.error("Error al cargar usuario:", err));
  }

  function eliminarRecepcionista(id) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    fetch(`${API_URL}/eliminar/${id}`, {
      method: "DELETE",
      headers: authHeader()
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al eliminar");
        cargarRecepcionistas();
      })
      .catch(err => console.error("Error al eliminar recepcionista:", err));
  }

  document.getElementById("nuevoBtn").addEventListener("click", abrirModalCrear);
  document.getElementById("recepcionistaForm").addEventListener("submit", guardarRecepcionista);

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("editar-btn")) {
      cargarRecepcionistaEnFormulario(e.target.dataset.id);
    }
    if (e.target.classList.contains("eliminar-btn")) {
      eliminarRecepcionista(e.target.dataset.id);
    }
  });

  cargarRecepcionistas();
});
