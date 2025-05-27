package com.gestion.gym.service;

import com.gestion.gym.model.Membresia;
import com.gestion.gym.repository.MembresiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MembresiaService {

    @Autowired
    private MembresiaRepository membresiaRepository;

    public List<Membresia> obtenerTodas() {
        return membresiaRepository.findAll();
    }

    public Optional<Membresia> obtenerPorId(int id) {
        return membresiaRepository.findById(id);
    }

    public Membresia guardar(Membresia membresia) {
        return membresiaRepository.save(membresia);
    }

    public void eliminar(int id) {
        membresiaRepository.deleteById(id);
    }
}

