package com.gestion.gym.service;

import com.gestion.gym.model.Producto;
import com.gestion.gym.model.Venta;
import com.gestion.gym.model.VentaProducto;
import com.gestion.gym.repository.ProductoRepository;
import com.gestion.gym.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public Venta registrarVenta(Venta venta) {
        if (venta.getFecha() == null) {
            venta.setFecha(LocalDate.now());
        }

        List<VentaProducto> ventaProductos = new ArrayList<>();

        for (VentaProducto vp : venta.getVentaProductos()) {
            Producto producto = productoRepository.findById(vp.getProducto().getId_producto())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

            if (producto.getStock() < vp.getCantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            vp.setProducto(producto);
            vp.setVenta(venta);
            vp.setPrecio_unitario(producto.getPrecio());

            producto.setStock(producto.getStock() - vp.getCantidad());

            ventaProductos.add(vp);
        }

        venta.setVentaProductos(ventaProductos);
        return ventaRepository.save(venta);
    }


    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> buscarPorId(int id) {
        return ventaRepository.findById(id);
    }

    public void eliminarVenta(int id) {
        ventaRepository.deleteById(id);
    }


}
