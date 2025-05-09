// admin-membresias.js

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
          opt.value = cliente.id_cliente;
          opt.textContent = `${cliente.nombre} ${cliente.apellido}`;
          select.appendChild(opt);
        });
        $("#clienteSelect").select2({ placeholder: "Buscar cliente..." });
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
        document.getElementById("crearMembresiaForm").dataset.editandoId = id; // guardar estado
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
        cargarMembresias();
        cargarMembresiasGestion();
      })
      .catch(err => alert(err.message));
  }
  
  function cargarMembresiasAsignadas() {
    fetch("http://localhost:8080/api/membresiasCliente/listar", authHeader())
      .then(res => res.json())
      .then(data => {
        const table = $("#tablaMembresias").DataTable();
        table.clear();
        data.forEach(item => {
          table.row.add([
            `${item.cliente.nombre} ${item.cliente.apellido}`,
            item.membresia.nombre,
            item.fechaInicio,
            item.fechaFin,
            item.activa ? "Activa" : "Vencida"
          ]);
        });
        table.draw();
      });
  }
  
  // Asignar membresía
  document.getElementById("membresiaForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const clienteId = document.getElementById("clienteSelect").value;
    const membresiaId = document.getElementById("membresiaSelect").value;
  
    if (!clienteId || !membresiaId) return alert("Seleccione cliente y membresía");
  
    fetch(`http://localhost:8080/api/membresiasCliente/asignar?clienteId=${clienteId}&membresiaId=${membresiaId}`, {
      method: "POST",
      ...authHeader()
    })
      .then(res => res.text())
      .then(() => {
        alert("Membresía asignada con éxito");
        document.getElementById("membresiaForm").reset();
        cargarMembresiasAsignadas();
      })
      .catch(err => alert("Error al asignar membresía"));
  });
  
  // Crear membresía
  document.getElementById("crearMembresiaForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombreMembresia").value;
    const precio = document.getElementById("precioMembresia").value;
    const duracion = document.getElementById("duracionMembresia").value;
  
    if (!nombre || !precio || !duracion) return alert("Complete todos los campos");
  
    const membresia = {
      nombre,
      precio: parseFloat(precio),
      duracionDias: parseInt(duracion),
      activa: true
    };
  
    fetch("http://localhost:8080/api/membresias/crear", {
      method: "POST",
      ...authHeader(),
      body: JSON.stringify(membresia)
    })
      .then(res => res.json())
      .then(() => {
        alert("Membresía creada con éxito");
        document.getElementById("crearMembresiaForm").reset();
        cargarMembresias();
      })
      .catch(err => alert("Error al crear membresía"));
  });
  
  // Inicializar todo
  document.addEventListener("DOMContentLoaded", () => {
    $('#tablaMembresias').DataTable();
    cargarClientes();
    cargarMembresias();
    cargarMembresiasAsignadas();
  
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      document.getElementById("username").textContent = payload.sub;
    }
  });