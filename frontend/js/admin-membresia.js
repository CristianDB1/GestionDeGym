function authHeader() {
  return {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    }
  };
}

function cargarClientes() {
  fetch("http://localhost:8080/api/clientes/listar", authHeader())
    .then(res => res.json())
    .then(clientes => {
      const select = document.getElementById("clienteSelect");
      select.innerHTML = "<option value=''>Seleccione un cliente</option>";
      clientes.forEach(cliente => {
        const opt = document.createElement("option");
        opt.value = cliente.idCliente;
        opt.textContent = `${cliente.nombre} ${cliente.apellido}`;
        select.appendChild(opt);
      });
      // Inicializa Select2 después de cargar los clientes
      $('#clienteSelect').select2({ placeholder: "Buscar cliente..." });
    });
}

function cargarMembresiasSelect() {
  fetch("http://localhost:8080/api/membresias/listar", authHeader())
    .then(res => res.json())
    .then(membresias => {
      const select = document.getElementById("membresiaSelect");
      select.innerHTML = "<option value=''>Seleccione una membresía</option>";
      membresias.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id_membresia;
        opt.textContent = `${m.nombre} - ${m.precio} COP (${m.duracionDias} días)`;
        select.appendChild(opt);
      });
    });
}

function cargarMembresiasAsignadas() {
  fetch("http://localhost:8080/api/membresiasCliente/listar", authHeader())
    .then(res => res.json())
    .then(data => {
      const tabla = $('#tablaMembresias').DataTable();
      tabla.clear();
      data.forEach(item => {
        tabla.row.add([
          `${item.cliente.nombre} ${item.cliente.apellido}`,
          item.membresia.nombre,
          item.fechaInicio,
          item.fechaFin,
          item.activa ? "Activa" : "Vencida"
        ]);
      });
      tabla.draw();
    });
}

function cargarMembresiasGestion() {
  fetch("http://localhost:8080/api/membresias/listar", authHeader())
    .then(res => res.json())
    .then(membresias => {
      const tabla = $("#tablaGestionMembresias").DataTable();
      tabla.clear();
      membresias.forEach(m => {
        tabla.row.add([
          m.nombre,
          m.precio,
          `${m.duracionDias} días`,
          m.activa ? "Activa" : "Inactiva",
          `
            <button class="btn btn-sm btn-warning" onclick="editarMembresia(${m.id_membresia})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarMembresia(${m.id_membresia})">Eliminar</button>
          `
        ]);
      });
      tabla.draw();
    });
}

function editarMembresia(id) {
  fetch(`http://localhost:8080/api/membresias/buscar/${id}`, authHeader())
    .then(res => res.json())
    .then(m => {
      document.getElementById("nombreMembresia").value = m.nombre;
      document.getElementById("precioMembresia").value = m.precio;
      document.getElementById("duracionMembresia").value = m.duracionDias;
      document.getElementById("crearMembresiaForm").dataset.editandoId = id;
    });
}

function eliminarMembresia(id) {
  if (!confirm("¿Seguro que deseas eliminar esta membresía?")) return;

  fetch(`http://localhost:8080/api/membresias/eliminar/${id}`, {
    method: "DELETE",
    ...authHeader()
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al eliminar");
      alert("Membresía eliminada correctamente");
      cargarMembresiasSelect();
      cargarMembresiasGestion();
    })
    .catch(err => alert(err.message));
}

function resetFormularioMembresia() {
  const form = document.getElementById("crearMembresiaForm");
  form.reset();
  delete form.dataset.editandoId;
}

document.addEventListener("DOMContentLoaded", () => {
  $('#tablaMembresias').DataTable();
  $('#tablaGestionMembresias').DataTable();

  cargarClientes();
  cargarMembresiasSelect();
  cargarMembresiasAsignadas();
  cargarMembresiasGestion();

  const token = localStorage.getItem("token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    document.getElementById("username").textContent = payload.sub;
  }

  document.getElementById("membresiaForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const clienteSelect = document.getElementById("clienteSelect");
  const membresiaSelect = document.getElementById("membresiaSelect");

  const clienteId = clienteSelect?.value?.trim();
  const membresiaId = membresiaSelect?.value?.trim();

  if (!clienteId || clienteId === "") {
    alert("Debe seleccionar un cliente válido.");
    clienteSelect.focus();
    return;
  }

  if (!membresiaId || membresiaId === "") {
    alert("Debe seleccionar una membresía válida.");
    membresiaSelect.focus();
    return;
  }

  if (!confirm("¿Desea asignar esta membresía al cliente?")) return;

  fetch(`http://localhost:8080/api/membresiasCliente/asignar?clienteId=${clienteId}&membresiaId=${membresiaId}`, {
    method: "POST",
    ...authHeader()
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("No se pudo asignar la membresía");
      }
      return res.text();
    })
    .then(() => {
      alert("Membresía asignada con éxito");
      document.getElementById("membresiaForm").reset();
      cargarMembresiasAsignadas();
    })
    .catch(err => {
      console.error("Error al asignar membresía:", err);
      alert("Hubo un error al asignar la membresía.");
    });
});

  document.getElementById("crearMembresiaForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombreMembresia").value;
    const precio = document.getElementById("precioMembresia").value;
    const duracion = document.getElementById("duracionMembresia").value;
    const id = this.dataset.editandoId;

    if (!nombre || !precio || !duracion) return alert("Complete todos los campos");

    const membresia = {
      nombre,
      precio: parseFloat(precio),
      duracionDias: parseInt(duracion),
      activa: true
    };

    const url = id
      ? `http://localhost:8080/api/membresias/actualizar/${id}`
      : `http://localhost:8080/api/membresias/crear`;
    const method = id ? "PUT" : "POST";

    fetch(url, {
      method,
      ...authHeader(),
      body: JSON.stringify(membresia)
    })
      .then(res => res.json())
      .then(() => {
        alert(id ? "Membresía actualizada" : "Membresía creada");
        this.reset();
        delete this.dataset.editandoId;
        cargarMembresiasSelect();
        cargarMembresiasGestion();
      })
      .catch(err => alert("Error al guardar membresía"));
  });
});