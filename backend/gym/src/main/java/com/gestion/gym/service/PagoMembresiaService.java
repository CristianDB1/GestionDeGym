package com.gestion.gym.service;

import com.gestion.gym.model.PagoMembresia;
import com.gestion.gym.repository.PagoMembresiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagoMembresiaService {

    @Autowired
    private PagoMembresiaRepository pagoMembresiaRepository;

    public PagoMembresia registrarPagoMembresia(PagoMembresia pagoMembresia) {
        return pagoMembresiaRepository.save(pagoMembresia);
    }

    public List<PagoMembresia> obtenerTodos() {
        return pagoMembresiaRepository.findAll();
    }
}
