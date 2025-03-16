package com.gestion.gym.service;

import com.gestion.gym.model.Usuario;
import com.gestion.gym.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(int id) {
        return usuarioRepository.findById(id);
    }

    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Usuario autenticar(String email, String password) {
        return usuarioRepository.findByEmailAndPassword(email, password);
    }

    public void eliminar(int id) {
        usuarioRepository.deleteById(id);
    }
}
