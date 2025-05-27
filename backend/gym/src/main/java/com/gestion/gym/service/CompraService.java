package com.gestion.gym.service;

import com.gestion.gym.model.Compra;
import com.gestion.gym.model.CompraProducto;
import com.gestion.gym.model.Producto;
import com.gestion.gym.repository.CompraRepository;
import com.gestion.gym.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CompraService {

    @Autowired
    private final CompraRepository compraRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public CompraService(CompraRepository compraRepository) {
        this.compraRepository = compraRepository;
    }

    public Compra guardarCompra(Compra compra) {
        compra.setFecha(LocalDate.now());

        for (CompraProducto cp : compra.getProductos()) {
            Producto producto = productoRepository.findById(cp.getProducto().getId_producto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            producto.setStock(producto.getStock() + cp.getCantidad());
            productoRepository.save(producto);
        }

        return compraRepository.save(compra);
    }

    public List<Compra> listarCompras() {
        return compraRepository.findAll();
    }
}
