package com.gestion.gym.repository;

import com.gestion.gym.model.Compra;
import com.gestion.gym.model.CompraProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompraProductoRepository extends JpaRepository<CompraProducto, Integer> {
    List<CompraProducto> findByCompra(Compra compra);
}