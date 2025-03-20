package com.gestion.gym.service;

import com.gestion.gym.model.Producto;
import com.gestion.gym.model.Venta;
import com.gestion.gym.model.VentaProducto;
import com.gestion.gym.model.VentaProductoDTO;
import com.gestion.gym.repository.ProductoRepository;
import com.gestion.gym.repository.VentaProductoRepository;
import com.gestion.gym.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VentaProductoService {

    @Autowired
    private VentaProductoRepository ventaProductoRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public VentaProducto asociarProductoAVenta(int ventaId, int productoId, int cantidad) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        double subtotal = producto.getPrecio() * cantidad;

        VentaProducto ventaProducto = new VentaProducto(venta, producto, cantidad, subtotal);
        return ventaProductoRepository.save(ventaProducto);
    }

    public List<VentaProductoDTO> obtenerTodos() {
        List<VentaProducto> ventaProductos = ventaProductoRepository.findAll();
        return ventaProductos.stream()
                .map(vp -> new VentaProductoDTO(
                        vp.getId(),
                        vp.getVenta(),
                        vp.getProducto(),
                        vp.getCantidad(),
                        vp.getSubtotal()
                ))
                .collect(Collectors.toList());
    }
}
