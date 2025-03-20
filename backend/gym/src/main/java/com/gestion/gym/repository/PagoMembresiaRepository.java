package com.gestion.gym.repository;

import com.gestion.gym.model.PagoMembresia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoMembresiaRepository extends JpaRepository<PagoMembresia, Integer> {
}
