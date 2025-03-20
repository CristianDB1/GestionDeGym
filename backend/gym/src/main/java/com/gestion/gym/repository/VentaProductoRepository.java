package com.gestion.gym.repository;

import com.gestion.gym.model.VentaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VentaProductoRepository extends JpaRepository<VentaProducto, Integer> {
}
