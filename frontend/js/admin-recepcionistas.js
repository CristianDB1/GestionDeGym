document.addEventListener("DOMContentLoaded", () => {
  const AUTH_URL = "http://localhost:8080/api/auth/register";
  const API_URL  = "http://localhost:8080/api/usuarios";
  const token    = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  // Mostrar usuario en navbar
  const payload = JSON.parse(atob(token.split(".")[1]));
  document.getElementById("username").textContent = payload.sub;

  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type":  "application/json"
  };

  const dt = new DataTable("#tablaRecepcionistas");

  // 1) LISTAR
  function cargar() {
    fetch(`${API_URL}/listar`, { headers: authHeaders })
      .then(r => r.json())
      .then(users => {
        dt.clear();
        users.filter(u => u.rol?.nombre === "RECEPCIONISTA")
             .forEach(u => dt.row.add([
               u.idUsuario,
               u.nombre,
               u.apellido,
               u.username,
               u.rol_id.nombre,
               `<button class="btn btn-sm btn-warning editar" data-id="${u.idUsuario}">Editar</button>
                <button class="btn btn-sm btn-danger eliminar" data-id="${u.idUsuario}">Eliminar</button>`
             ]));
        dt.draw();
      })
      .catch(console.error);
  }

  // 2) RESET FORM
  function resetForm() {
    const f = document.getElementById("formRecepcionista");
    f.reset();
    delete f.dataset.editingId;
    document.getElementById("password").required = true;
  }

  // 3) SUBMIT (CREAR / ACTUALIZAR)
  document.getElementById("formRecepcionista").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const id   = form.dataset.editingId;
    const n    = document.getElementById("nombre").value.trim();
    const a    = document.getElementById("apellido").value.trim();
    const u    = document.getElementById("userUsername").value.trim();
    const p    = document.getElementById("password").value.trim();

    if (!n || !a || !u || (!id && !p)) {
      return alert("Complete todos los campos obligatorios");
    }

    // Payload base
    const user = { nombre: n, apellido: a, username: u };

    if (!id) {
      // creación: incluye contraseña y rol
      user.password = p;
      user.rol = { idRol: 2 };  // solo ID, el backend asigna el resto
    }

    try {
      let res;
      if (!id) {
        // 👉 CREATE via AUTH REGISTER (con token también)
        res = await fetch(AUTH_URL, {
          method:  "POST",
          headers: authHeaders,    // llegar con token
          body:    JSON.stringify(user)
        });
      } else {
        // 👉 UPDATE via /api/usuarios/actualizar/{id}
        res = await fetch(`${API_URL}/actualizar/${id}`, {
          method:  "PUT",
          headers: authHeaders,
          body:    JSON.stringify(user)
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      alert(id ? "Recepcionista actualizado" : "Recepcionista creado");
      resetForm();
      cargar();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  });

  // 4) EDITAR / ELIMINAR delegado
  document.addEventListener("click", e => {
    const btn = e.target;
    const id  = btn.dataset.id;
    if (btn.classList.contains("editar")) {
      fetch(`${API_URL}/buscar/${id}`, { headers: authHeaders })
        .then(r => r.json())
        .then(u => {
          const f = document.getElementById("formRecepcionista");
          f.dataset.editingId = u.idUsuario;
          document.getElementById("nombre").value       = u.nombre;
          document.getElementById("apellido").value     = u.apellido;
          document.getElementById("userUsername").value = u.username;
          document.getElementById("password").required  = false;
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(() => alert("No se pudo cargar datos"));
    }
    if (btn.classList.contains("eliminar")) {
      if (!confirm("¿Eliminar recepcionista?")) return;
      fetch(`${API_URL}/eliminar/${id}`, {
        method:  "DELETE",
        headers: authHeaders
      })
        .then(r => {
          if (!r.ok) throw new Error(r.statusText);
          alert("Eliminado");
          cargar();
        })
        .catch(() => alert("No se pudo eliminar"));
    }
  });

  // Inicial
  cargar();
  resetForm();
});
