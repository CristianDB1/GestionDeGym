package com.gestion.gym.service;

import com.gestion.gym.model.Compra;
import com.gestion.gym.model.CompraProducto;
import com.gestion.gym.model.Producto;
import com.gestion.gym.model.Proveedor;
import com.gestion.gym.repository.CompraRepository;
import com.gestion.gym.repository.ProductoRepository;
import com.gestion.gym.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Service
public class CompraService {

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    public Compra registrarCompra(Compra compra){
        if(compra.getFecha() == null){
            compra.setFecha(LocalDate.now());
        }

        for (CompraProducto cp : compra.getCompraProductos()){
            Producto producto = productoRepository.findById(cp.getProducto().getId_producto())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
            Proveedor proveedor = proveedorRepository.findById(cp.getProveedor().getId_proveedor())
                    .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado"));

            cp.setProducto(producto);
            cp.setProveedor(proveedor);
            cp.setCompra(compra);

            producto.setStock(producto.getStock() + cp.getCantidad());
        }

        return compraRepository.save(compra);
    }

    public List<Compra> obtenerTodas() {
        return compraRepository.findAll();
    }



    public Optional<Compra> buscarPorId(int id){
        return compraRepository.findById(id);
    }

    public void eliminarCompra(int id){
        compraRepository.deleteById(id);
    }

}
