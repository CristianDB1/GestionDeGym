package com.gestion.gym.service;

import com.gestion.gym.model.Compra;
import com.gestion.gym.model.CompraProducto;
import com.gestion.gym.repository.CompraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompraService {

    @Autowired
    private final CompraRepository compraRepository;

    public CompraService(CompraRepository compraRepository) {
        this.compraRepository = compraRepository;
    }

    public Compra guardarCompra(Compra compra) {
        for(CompraProducto cp: compra.getProductos()) {
            cp.setCompra(compra);
        }
        return compraRepository.save(compra);
    }

    public List<Compra> listarCompras() {
        return compraRepository.findAll();
    }
}
