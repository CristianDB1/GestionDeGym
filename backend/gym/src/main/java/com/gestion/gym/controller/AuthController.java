package com.gestion.gym.controller;

import com.gestion.gym.model.Rol;
import com.gestion.gym.model.Usuario;
import com.gestion.gym.security.JwtUtil;
import com.gestion.gym.service.RolService;
import com.gestion.gym.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usuario.getUsername(), usuario.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getUsername());

            // Obtener el rol del usuario autenticado
            Usuario usuarioDB = usuarioService.obtenerPorUsuario(usuario.getUsername()).orElseThrow();
            String role = usuarioDB.getRol().getNombre();

            String token = jwtUtil.generateToken(userDetails.getUsername(), role);

            return ResponseEntity.ok(Map.of("token", token, "role", role)); // Enviamos el rol en la respuesta

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", "Usuario o contraseña incorrectos"));
        }
    }


    @PostMapping("/crear")
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, Object> payload) {
        try {
            // Obtener los valores del JSON
            String nombre = (String) payload.get("nombre");
            String apellido = (String) payload.get("apellido");
            String username = (String) payload.get("username");
            String password = (String) payload.get("password");
            Integer rolId = (Integer) payload.get("rol_id");

            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La contraseña no puede estar vacía.");
            }

            // Buscar el rol en la base de datos
            Rol rol = RolService.obtenerPorId(rolId).orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

            // Crear y guardar el usuario
            Usuario usuario = new Usuario();
            usuario.setNombre(nombre);
            usuario.setApellido(apellido);
            usuario.setUsername(username);
            usuario.setPassword(passwordEncoder.encode(password));
            usuario.setRol(rol);

            Usuario nuevoUsuario = usuarioService.guardar(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


}

