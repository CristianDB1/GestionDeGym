package com.gestion.gym.controller;

import com.gestion.gym.model.Usuario;
import com.gestion.gym.security.JwtUtil;
import com.gestion.gym.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Usuario usuario) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                usuario.getUsername(), usuario.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getUsername());

        // Obtener el rol del usuario autenticado
        Usuario usuarioDB = usuarioService.obtenerPorUsuario(usuario.getUsername()).orElseThrow();
        String role = usuarioDB.getRol().getNombre();

        String token = jwtUtil.generateToken(userDetails.getUsername(), role);

        return Map.of("token", token, "role", role);  // Enviamos el rol en la respuesta
    }


    @PostMapping("/register")
    public Usuario register(@RequestBody Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioService.guardar(usuario);
    }
}

