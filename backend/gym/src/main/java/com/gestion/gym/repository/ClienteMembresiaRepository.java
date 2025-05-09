package com.gestion.gym.repository;

import com.gestion.gym.model.ClienteMembresia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ClienteMembresiaRepository extends JpaRepository<ClienteMembresia, Integer> {
}
