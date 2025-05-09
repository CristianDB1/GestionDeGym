package com.gestion.gym.service;

import com.gestion.gym.model.Producto;
import com.gestion.gym.model.Venta;
import com.gestion.gym.model.VentaProducto;
import com.gestion.gym.repository.ProductoRepository;
import com.gestion.gym.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public Venta guardarVenta(Venta venta) {
        venta.setFecha(LocalDate.now());

        for (VentaProducto vp : venta.getProductos()) {
            Producto producto = productoRepository.findById(vp.getProducto().getId_producto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getStock() < vp.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - vp.getCantidad());
            productoRepository.save(producto);

            vp.setVenta(venta);
        }

        return ventaRepository.save(venta);
    }

    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }

    public boolean eliminarVenta(int id) {
        Optional<Venta> ventaOpt = ventaRepository.findById(id);
        if (ventaOpt.isPresent()) {
            ventaRepository.delete(ventaOpt.get());
            return true;
        }
        return false;
    }


}
