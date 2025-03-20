package com.gestion.gym.service;

import com.gestion.gym.model.Pago;
import com.gestion.gym.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    public List<Pago> obtenerTodos() {
        return pagoRepository.findAll();
    }

    public Optional<Pago> obtenerPorId(int id) {
        return pagoRepository.findById(id);
    }

    public Pago guardar(Pago pago) {
        return pagoRepository.save(pago);
    }

    public void eliminar(int id) {
        pagoRepository.deleteById(id);
    }
}

