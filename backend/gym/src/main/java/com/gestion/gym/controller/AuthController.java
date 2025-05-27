package com.gestion.gym.controller;

import com.gestion.gym.model.Usuario;
import com.gestion.gym.security.JwtUtil;
import com.gestion.gym.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usuario.getUsername(), usuario.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getUsername());

            Usuario usuarioDB = usuarioService.obtenerPorUsuario(usuario.getUsername()).orElseThrow();
            String role = usuarioDB.getRol().getNombre();

            String token = jwtUtil.generateToken(userDetails.getUsername(), role);

            return ResponseEntity.ok(Map.of("token", token, "role", role));

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Usuario o contraseña incorrectos"));
        }
    }



}

