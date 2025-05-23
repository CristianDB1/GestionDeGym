package com.gestion.gym.repository;

import com.gestion.gym.model.CompraProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompraProductoRepository extends JpaRepository<CompraProducto, Integer> {
}
