document.addEventListener("DOMContentLoaded", function () {
  const API_USUARIOS = "http://localhost:8080/api/usuarios";
  const API_AUTH = "http://localhost:8080/api/auth";
  const token = localStorage.getItem("token");

  const tabla = new DataTable("#tablaRecepcionistas");
  let modoEdicion = false;
  let idRecepcionistaEditando = null;

  if (!token) {
    alert("No hay token. Inicie sesión.");
    window.location.href = "../index.html";
    return;
  }

  function authHeaders() {
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  function cargarRecepcionistas() {
    fetch(`${API_USUARIOS}/listar`, {
      method: "GET",
      headers: authHeaders()
    })
      .then(response => {
        if (!response.ok) throw new Error("Error en la solicitud");
        return response.json();
      })
      .then(usuarios => {
        tabla.clear();
        usuarios
          .filter(u => u.rol?.nombre === "RECEPCIONISTA")
          .forEach(usuario => {
            tabla.row.add([
              usuario.id_usuario,
              usuario.nombre,
              usuario.apellido,
              usuario.username,
              usuario.rol.nombre,
              `
                <button class="btn btn-warning btn-sm editar" data-id="${usuario.id_usuario}">Editar</button>
                <button class="btn btn-danger btn-sm eliminar" data-id="${usuario.id_usuario}">Eliminar</button>
              `
            ]);
          });
        tabla.draw();
      })
      .catch(err => console.error("Error al cargar recepcionistas:", err));
  }

  function limpiarFormulario() {
    document.getElementById("recepcionistaForm").reset();
    document.getElementById("recepcionistaId").value = "";
    modoEdicion = false;
    idRecepcionistaEditando = null;
  }

  function crearRecepcionista(usuario) {
    fetch(`${API_AUTH}/crear`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(usuario)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al crear recepcionista");
        return res.json();
      })
      .then(() => {
        $("#recepcionistaModal").modal("hide");
        cargarRecepcionistas();
      })
      .catch(err => {
        console.error("Error en creación:", err);
        alert("Error al crear recepcionista");
      });
  }

  function actualizarRecepcionista(id, usuario) {
    fetch(`${API_USUARIOS}/actualizar/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(usuario)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar recepcionista");
        return res.json();
      })
      .then(() => {
        $("#recepcionistaModal").modal("hide");
        cargarRecepcionistas();
      })
      .catch(err => {
        console.error("Error en actualización:", err);
        alert("Error al actualizar recepcionista");
      });
  }

  function guardarRecepcionista(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!nombre || !apellido || !username || (!modoEdicion && !password)) {
      alert("Todos los campos son obligatorios. La contraseña solo se requiere para crear.");
      return;
    }

    if (modoEdicion && !idRecepcionistaEditando) {
      alert("Error interno: no se encontró el ID a editar.");
      return;
    }

    if (modoEdicion) {
      const usuarioActualizado = {
        nombre,
        apellido,
        username,
        password,
        rol: { id: 2 }
      };
      actualizarRecepcionista(idRecepcionistaEditando, usuarioActualizado);
    } else {
      const nuevoUsuario = {
        nombre,
        apellido,
        username,
        password,
        rol_id: 2
      };
      crearRecepcionista(nuevoUsuario);
    }

    limpiarFormulario();
  }

  function cargarRecepcionistaParaEditar(id) {
    fetch(`${API_USUARIOS}/buscar/${id}`, {
      method: "GET",
      headers: authHeaders()
    })
      .then(res => res.json())
      .then(usuario => {
        document.getElementById("recepcionistaId").value = usuario.id_usuario;
        document.getElementById("nombre").value = usuario.nombre;
        document.getElementById("apellido").value = usuario.apellido;
        document.getElementById("username").value = usuario.username;
        document.getElementById("password").value = "";

        modoEdicion = true;
        idRecepcionistaEditando = usuario.id;

        $("#recepcionistaModal").modal("show");
      })
      .catch(err => {
        console.error("Error al cargar recepcionista:", err);
        alert("No se pudo cargar el usuario.");
      });
  }

  function eliminarRecepcionista(id) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    fetch(`${API_USUARIOS}/eliminar/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al eliminar");
        cargarRecepcionistas();
      })
      .catch(err => {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar usuario");
      });
  }

  // Listeners
  document.getElementById("btnNuevoRecepcionista").addEventListener("click", function () {
    limpiarFormulario();
    $("#recepcionistaModal").modal("show");
  });

  document.getElementById("recepcionistaForm").addEventListener("submit", guardarRecepcionista);

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("editar")) {
      cargarRecepcionistaParaEditar(e.target.dataset.id);
    } else if (e.target.classList.contains("eliminar")) {
      eliminarRecepcionista(e.target.dataset.id);
    }
  });

  cargarRecepcionistas();
});
