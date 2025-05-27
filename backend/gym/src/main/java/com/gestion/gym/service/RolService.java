package com.gestion.gym.service;

import com.gestion.gym.model.Rol;
import com.gestion.gym.repository.RolRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RolService {

    private static RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        RolService.rolRepository = rolRepository;
    }

    public List<Rol> obtenerTodos() {
        return rolRepository.findAll();
    }

    public static Optional<Rol> obtenerPorId(int id) {
        return rolRepository.findById(id);
    }

    public Optional<Rol> obtenerPorNombre(String nombre) {
        return rolRepository.findByNombre(nombre);
    }

    @Transactional
    public Rol guardar(Rol rol) {
        if (rolRepository.existsByNombre(rol.getNombre())) {
            throw new IllegalArgumentException("El rol con nombre '" + rol.getNombre() + "' ya existe.");
        }
        return rolRepository.save(rol);
    }

    @Transactional
    public void eliminar(int id) {
        if (!rolRepository.existsById(id)) {
            throw new IllegalArgumentException("El rol con ID " + id + " no existe.");
        }
        rolRepository.deleteById(id);
    }
}

