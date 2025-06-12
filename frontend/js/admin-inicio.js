document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8080/api";
    let ventasChart, productosChart, membresiasChart;
    const DIAS_AVISO_VENCIMIENTO = 7;

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

    function cargarDashboard() {
        Promise.all([
            fetch(`${API_URL}/clientes/listar`, authHeader()).then(res => res.json()),
            fetch(`${API_URL}/ventas/listar`, authHeader()).then(res => res.json()),
            fetch(`${API_URL}/productos/listar`, authHeader()).then(res => res.json()),
            fetch(`${API_URL}/compras/listar`, authHeader()).then(res => res.json()),
            fetch(`${API_URL}/membresiasCliente/listar`, authHeader()).then(res => res.json()),
            fetch(`${API_URL}/membresias/listar`, authHeader()).then(res => res.json())
        ])
        .then(([clientes, ventas, productos, compras, membresiasCliente, tiposMembresias]) => {
            document.getElementById('totalClientes').textContent = clientes.length;
            document.getElementById('ventasHoy').textContent = `$${calcularVentasHoy(ventas).toFixed(2)}`;
            document.getElementById('totalProductos').textContent = productos.reduce((sum, p) => sum + p.stock, 0);
            document.getElementById('totalCompras').textContent = compras.length;

            const membresiasActivas = filtrarMembresiasActivas(membresiasCliente);
            const membresiasPorVencer = filtrarMembresiasPorVencer(membresiasCliente, DIAS_AVISO_VENCIMIENTO);
            
            document.getElementById('membresiasActivas').textContent = membresiasActivas.length;
            document.getElementById('membresiasPorVencer').textContent = membresiasPorVencer.length;

            cargarAlertasProductos(productos);
            cargarUltimasVentas(ventas);
            cargarAlertasMembresias(membresiasPorVencer, clientes);

            inicializarGraficoVentas(ventas);
            inicializarGraficoProductos(productos);
            inicializarGraficoMembresias(membresiasCliente, tiposMembresias);
        })
        .catch(err => {
            console.error("Error al cargar datos del dashboard:", err);
            showAlert('danger', 'Error al cargar datos del sistema');
        });
    }

    function calcularVentasHoy(ventas) {
        const hoy = new Date().toISOString().split('T')[0];
        return ventas
            .filter(v => {
                const fechaVenta = v.fecha.split('T')[0];
                return fechaVenta === hoy;
            })
            .reduce((sum, v) => {
                const totalVenta = v.total || calcularTotalVenta(v.ventaProductos) || 0;
                return sum + totalVenta;
            }, 0);
    }

    function filtrarMembresiasActivas(membresias) {
        const hoy = new Date();
        return membresias.filter(m => {
            try {
                const fin = new Date(m.fechaFin);
                return fin >= hoy;
            } catch {
                return false;
            }
        });
    }

    function calcularTotalVenta(ventaProductos) {
        if (!Array.isArray(ventaProductos)) return 0;
        return ventaProductos.reduce((sum, item) => {
            const precio = Number(item.precio_unitario) || 0;
            const cantidad = Number(item.cantidad) || 0;
            return sum + (precio * cantidad);
        }, 0);
    }

    function cargarAlertasMembresias(membresiasPorVencer, clientes) {
    const contenedor = document.getElementById('alertasMembresias');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (membresiasPorVencer.length === 0) {
        contenedor.innerHTML = `
            <div class="list-group-item text-center text-muted">
                No hay membresías por vencer
            </div>
        `;
        return;
    }
    
    membresiasPorVencer.forEach(m => {
        const cliente = clientes.find(c => c.idCliente === m.cliente?.idCliente);
        const fin = new Date(m.fechaFin);
        const diffTime = fin - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const alerta = document.createElement('div');
        alerta.className = `list-group-item list-group-item-action ${diffDays <= 3 ? 'danger-alert' : 'warning-alert'}`;
        alerta.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${cliente?.nombre || 'Cliente'} ${cliente?.apellido || ''}</h6>
                    <p class="mb-1">Membresía: ${m.membresia?.nombre || 'Desconocida'}</p>
                </div>
                <div class="text-end">
                    <span class="badge ${diffDays <= 3 ? 'bg-danger' : 'bg-warning'}">
                        ${diffDays} día${diffDays !== 1 ? 's' : ''}
                    </span>
                    <div class="text-muted small">Vence: ${fin.toLocaleDateString()}</div>
                </div>
            </div>
        `;
        
        contenedor.appendChild(alerta);
    });
}

    function filtrarMembresiasPorVencer(membresias, diasAviso) {
        const hoy = new Date();
        return membresias.filter(m => {
            try {
                const fin = new Date(m.fechaFin);
                const diffTime = fin - hoy;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= diasAviso && fin >= hoy;
            } catch {
                return false;
            }
        });
    }


    function cargarAlertasProductos(productos) {
        const contenedor = document.getElementById('alertasProductos');
        contenedor.innerHTML = '';
        
        const productosBajoStock = productos.filter(p => p.stock < 5); 
        
        if (productosBajoStock.length === 0) {
            contenedor.innerHTML = `
                <div class="list-group-item text-center text-muted">
                    No hay productos con bajo stock
                </div>
            `;
            return;
        }
        
        productosBajoStock.forEach(producto => {
            const alerta = document.createElement('a');
            alerta.className = 'list-group-item list-group-item-action';
            alerta.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${producto.nombre}</h6>
                    <small class="text-danger">${producto.stock} unidades</small>
                </div>
                <small class="text-muted">${producto.descripcion || 'Sin descripción'}</small>
            `;
            
            contenedor.appendChild(alerta);
            
            if (producto.stock <= 2) {
                mostrarNotificacion(
                    'danger',
                    `¡Stock crítico! ${producto.nombre} tiene solo ${producto.stock} unidades`
                );
            }
        });
    }

    function cargarUltimasVentas(ventas) {
        const contenedor = document.getElementById('ultimasVentas');
        contenedor.innerHTML = '';
        
        const ultimas = [...ventas]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);
        
        if (ultimas.length === 0) {
            contenedor.innerHTML = `
                <div class="list-group-item text-center text-muted">
                    No hay ventas registradas
                </div>
            `;
            return;
        }
        
        ultimas.forEach(venta => {
            const total = venta.total || calcularTotalVenta(venta.ventaProductos) || 0;
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Venta #${venta.id_venta}</h6>
                    <small>${new Date(venta.fecha).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">Total: $${total.toFixed(2)}</p>
                <small class="text-muted">${venta.cliente?.nombre || 'Cliente no especificado'}</small>
            `;
            contenedor.appendChild(item);
        });
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
                const fecha = v.fecha.split('T')[0];
                const total = v.total || calcularTotalVenta(v.ventaProductos) || 0;
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

    function inicializarGraficoVentas(ventas) {
        const ctx = document.getElementById('ventasChart').getContext('2d');
        
        if (ventasChart) {
            ventasChart.destroy();
        }

        const ventas7Dias = obtenerVentasUltimos7Dias(ventas);
        
        ventasChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ventas7Dias.map(item => {
                    const fecha = new Date(item.fecha);
                    return fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Ventas ($)',
                    data: ventas7Dias.map(item => item.total),
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

    function inicializarGraficoProductos(productos) {
        const ctx = document.getElementById('productosChart').getContext('2d');
        
        if (productosChart) {
            productosChart.destroy();
        }

        const topProductos = [...productos]
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 5);

        const colores = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
        ];

        productosChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: topProductos.map(p => p.nombre),
                datasets: [{
                    data: topProductos.map(p => p.stock),
                    backgroundColor: colores,
                    borderColor: colores.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function inicializarGraficoMembresias(membresiasCliente, tiposMembresias) {
        const ctx = document.getElementById('membresiasChart')?.getContext('2d');
        if (!ctx) return;
        
        if (membresiasChart) {
            membresiasChart.destroy();
        }

        const distribucion = calcularDistribucionMembresias(membresiasCliente, tiposMembresias);
        
        const colores = generarColores(distribucion.length);
        
        membresiasChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: distribucion.map(item => item.nombre),
                datasets: [{
                    data: distribucion.map(item => item.cantidad),
                    backgroundColor: colores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                },
                cutout: '70%'
            }
        });
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

    function generarColores(cantidad) {
        const colores = [];
        const hueStep = 360 / cantidad;
        
        for (let i = 0; i < cantidad; i++) {
            const hue = i * hueStep;
            colores.push(`hsl(${hue}, 70%, 60%)`);
        }
        
        return colores;
    }

    function mostrarNotificacion(tipo, mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
        notificacion.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notificacion.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${tipo === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2"></i>
                <div>${mensaje}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => notificacion.remove(), 150);
        }, 5000);
    }

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1100';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }

    cargarDashboard();

    setInterval(cargarDashboard, 300000);
});