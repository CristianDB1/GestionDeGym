document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:8080/api";
    const token = localStorage.getItem("token");
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    
    let ventasChart;
    let membresiasChart;
    const DIAS_AVISO_VENCIMIENTO = 7;

    async function cargarDashboard() {
        try {
            const clientesResponse = await fetch(`${API_URL}/clientes/listar`, { headers });
            const clientes = await clientesResponse.json();
            if (!Array.isArray(clientes)) throw new Error("Formato de clientes inválido");
            
            const membresiasResponse = await fetch(`${API_URL}/membresiasCliente/listar`, { headers });
            const membresiasCliente = await membresiasResponse.json();
            if (!Array.isArray(membresiasCliente)) throw new Error("Formato de membresías inválido");
            
            const ventasResponse = await fetch(`${API_URL}/ventas/listar`, { headers });
            const ventas = await ventasResponse.json();
            if (!Array.isArray(ventas)) throw new Error("Formato de ventas inválido");
            
            const tiposMembresiasResponse = await fetch(`${API_URL}/membresias/listar`, { headers });
            const tiposMembresias = await tiposMembresiasResponse.json();
            if (!Array.isArray(tiposMembresias)) throw new Error("Formato de tipos de membresías inválido");

            console.log("Datos de ventas recibidos:", ventas); 

            procesarDatos(clientes, membresiasCliente, ventas, tiposMembresias);
        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
            mostrarError("Error al cargar el dashboard. Recargue la página.");
        }
    }

    function procesarDatos(clientes, membresiasCliente, ventas, tiposMembresias) {
        try {
            document.getElementById("totalClientes").textContent = clientes.length;
            
            const hoy = new Date();
            const membresiasActivas = membresiasCliente.filter(m => {
                try {
                    const fin = new Date(m.fechaFin);
                    return fin >= hoy;
                } catch {
                    return false;
                }
            });
            
            const membresiasPorVencer = membresiasCliente.filter(m => {
                try {
                    const fin = new Date(m.fechaFin);
                    const diffTime = fin - hoy;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= DIAS_AVISO_VENCIMIENTO && fin >= hoy;
                } catch {
                    return false;
                }
            });
            
            document.getElementById("membresiasActivas").textContent = membresiasActivas.length;
            document.getElementById("membresiasPorVencer").textContent = membresiasPorVencer.length;
            
            const hoyISO = hoy.toISOString().split('T')[0];
            const ventasHoy = ventas
                .filter(v => v.fecha === hoyISO)
                .reduce((sum, v) => sum + (calcularTotalVenta(v.ventaProductos) || 0), 0);
            
            document.getElementById("ventasHoy").textContent = `$${ventasHoy.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            
            const ventas7Dias = obtenerVentasUltimos7Dias(ventas);
            crearGraficoVentas(ventas7Dias);
            
            const distribucionMembresias = calcularDistribucionMembresias(membresiasCliente, tiposMembresias);
            crearGraficoMembresias(distribucionMembresias);
            
            const alertas = generarAlertas(membresiasPorVencer, clientes);
            mostrarAlertas(alertas);
        } catch (error) {
            console.error("Error al procesar datos:", error);
            mostrarError("Error al procesar los datos. Intente nuevamente.");
        }
    }

    function calcularTotalVenta(ventaProductos) {
        try {
            if (!Array.isArray(ventaProductos)) return 0;
            return ventaProductos.reduce((sum, item) => {
                const precio = Number(item.precio_unitario) || 0;
                const cantidad = Number(item.cantidad) || 0;
                return sum + (precio * cantidad);
            }, 0);
        } catch {
            return 0;
        }
    }

    function obtenerVentasUltimos7Dias(ventas) {
        const hoy = new Date();
        const sieteDiasAtras = new Date(hoy);
        sieteDiasAtras.setDate(hoy.getDate() - 6); 
        
        const ventasFiltradas = ventas.filter(v => {
            try {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta >= sieteDiasAtras && fechaVenta <= hoy;
            } catch {
                return false;
            }
        });
        
        const ventasPorFecha = {};
        ventasFiltradas.forEach(v => {
            try {
                const fecha = v.fecha;
                const total = calcularTotalVenta(v.ventaProductos);
                ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + total;
            } catch (error) {
                console.error("Error procesando venta:", v, error);
            }
        });
        
        const resultado = [];
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(sieteDiasAtras);
            fecha.setDate(sieteDiasAtras.getDate() + i);
            const fechaISO = fecha.toISOString().split('T')[0];
            
            resultado.push({
                fecha: fechaISO,
                total: ventasPorFecha[fechaISO] || 0
            });
        }
        
        return resultado;
    }

    function calcularDistribucionMembresias(membresiasCliente, tiposMembresias) {
        const hoy = new Date();
        const distribucion = {};
        
        tiposMembresias.forEach(tipo => {
            distribucion[tipo.id_membresia] = {
                nombre: tipo.nombre,
                cantidad: 0
            };
        });
        
        membresiasCliente.forEach(m => {
            try {
                const fin = new Date(m.fechaFin);
                if (fin >= hoy) {
                    distribucion[m.membresia.id_membresia].cantidad++;
                }
            } catch {
            }
        });
        
        return Object.values(distribucion).filter(item => item.cantidad > 0);
    }

    function generarAlertas(membresiasPorVencer, clientes) {
        const alertas = [];
        const hoy = new Date();
        
        if (membresiasPorVencer.length > 0) {
            alertas.push({
                titulo: "Membresías por vencer",
                mensaje: `${membresiasPorVencer.length} membresías están por vencer en los próximos ${DIAS_AVISO_VENCIMIENTO} días`,
                tipo: "warning",
                fecha: hoy.toISOString()
            });
            
            const proximasAVencer = [...membresiasPorVencer]
                .sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
                .slice(0, 3);
            
            proximasAVencer.forEach(m => {
                const cliente = clientes.find(c => c.idCliente === m.cliente.idCliente);
                const fin = new Date(m.fechaFin);
                const diffTime = fin - hoy;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                alertas.push({
                    titulo: `Membresía por vencer: ${cliente.nombre} ${cliente.apellido}`,
                    mensaje: `Membresía ${m.membresia.nombre} vence en ${diffDays} días (${fin.toLocaleDateString()})`,
                    tipo: "warning",
                    fecha: m.fechaFin
                });
            });
        }
        
        if (alertas.length === 0) {
            alertas.push({
                titulo: "Todo en orden",
                mensaje: "No hay alertas importantes para mostrar",
                tipo: "success",
                fecha: hoy.toISOString()
            });
        }
        
        return alertas;
    }

    function crearGraficoVentas(datos) {
        const ctx = document.getElementById('ventasChart').getContext('2d');
        
        const labels = datos.map(item => {
            const fecha = new Date(item.fecha);
            return fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
        });
        
        const valores = datos.map(item => item.total);

        if (ventasChart) {
            ventasChart.destroy();
        }

        ventasChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: valores,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-CO');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.raw.toLocaleString('es-CO');
                            }
                        }
                    }
                }
            }
        });
    }

    function crearGraficoMembresias(datos) {
        const ctx = document.getElementById('membresiasChart').getContext('2d');
        const legendContainer = document.getElementById('membresiasLegend');
        
        const labels = datos.map(item => item.nombre);
        const valores = datos.map(item => item.cantidad);
        const colores = generarColores(datos.length);

        if (membresiasChart) {
            membresiasChart.destroy();
        }

        membresiasChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: colores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });

        legendContainer.innerHTML = '';
        datos.forEach((item, index) => {
            const legendItem = document.createElement('span');
            legendItem.className = 'me-3';
            legendItem.innerHTML = `
                <i class="bi bi-square-fill me-1" style="color: ${colores[index]}"></i>
                ${item.nombre} (${item.cantidad})
            `;
            legendContainer.appendChild(legendItem);
        });
    }

    function generarColores(cantidad) {
        const colores = [];
        const hueStep = 360 / cantidad;
        
        for (let i = 0; i < cantidad; i++) {
            const hue = i * hueStep;
            colores.push(`hsl(${hue}, 70%, 60%)`);
        }
        
        return colores;
    }

    function mostrarAlertas(alertas) {
        const container = document.getElementById('alertasContainer');
        container.innerHTML = '';
        
        if (alertas.length === 0) {
            container.innerHTML = '<div class="list-group-item">No hay alertas importantes</div>';
            return;
        }
        
        alertas.forEach(alerta => {
            const alertaItem = document.createElement('div');
            alertaItem.className = `list-group-item d-flex justify-content-between align-items-center ${alerta.tipo}-alert`;
            
            alertaItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi ${obtenerIconoAlerta(alerta.tipo)} me-3"></i>
                    <div>
                        <h6 class="mb-1">${alerta.titulo}</h6>
                        <small class="text-muted">${alerta.mensaje}</small>
                    </div>
                </div>
                <small class="text-muted">${new Date(alerta.fecha).toLocaleDateString()}</small>
            `;
            
            container.appendChild(alertaItem);
        });
    }

    function obtenerIconoAlerta(tipo) {
        switch(tipo) {
            case 'danger': return 'bi-exclamation-triangle-fill text-danger';
            case 'warning': return 'bi-exclamation-circle-fill text-warning';
            case 'success': return 'bi-check-circle-fill text-success';
            default: return 'bi-info-circle-fill text-primary';
        }
    }

    function mostrarError(mensaje) {
        const container = document.getElementById('alertasContainer');
        container.innerHTML = `
            <div class="list-group-item danger-alert">
                <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                ${mensaje}
            </div>
        `;
    }

    cargarDashboard();
});