package com.gestion.gym.service;

import com.gestion.gym.model.Compra;
import com.gestion.gym.model.CompraProducto;
import com.gestion.gym.repository.CompraProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class compraProductoService {

    @Autowired
    private CompraProductoRepository compraProductoRepository;

    public List<CompraProducto> obtenerPorCompra(Compra compra) {
        return compraProductoRepository.findByCompra(compra);
    }
}
