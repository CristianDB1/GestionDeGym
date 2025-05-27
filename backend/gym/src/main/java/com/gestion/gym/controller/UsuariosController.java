package com.gestion.gym.controller;

import com.gestion.gym.model.Rol;
import com.gestion.gym.model.Usuario;
import com.gestion.gym.service.RolService;
import com.gestion.gym.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class UsuariosController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UsuarioService usuarioService;

    public UsuariosController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Usuario>> obtenerTodosUsuarios() {
        List<Usuario> usuarios = usuarioService.obtenerTodos();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable int id) {
        return usuarioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearUsuarioDesdeAdmin(@RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre");
            String apellido = (String) payload.get("apellido");
            String username = (String) payload.get("username");
            String password = (String) payload.get("password");
            Integer rolId = (Integer) payload.get("rol_id");

            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("La contraseña no puede estar vacía.");
            }

            Rol rol = RolService.obtenerPorId(rolId)
                    .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

            Usuario nuevo = new Usuario();
            nuevo.setNombre(nombre);
            nuevo.setApellido(apellido);
            nuevo.setUsername(username);
            nuevo.setPassword(passwordEncoder.encode(password));
            nuevo.setRol(rol);

            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.guardar(nuevo));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable int id, @RequestBody Usuario usuario) {
        return usuarioService.obtenerPorId(id)
                .map(usuarioExistente -> {
                    usuarioExistente.setNombre(usuario.getNombre());
                    usuarioExistente.setApellido(usuario.getApellido());
                    usuarioExistente.setUsername(usuario.getUsername());
                    usuarioExistente.setPassword(usuario.getPassword());
                    usuarioExistente.setRol(usuario.getRol());

                    Usuario usuarioActualizado = usuarioService.guardar(usuarioExistente);
                    return ResponseEntity.ok(usuarioActualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Object> eliminarUsuario(@PathVariable int id) {
        return usuarioService.obtenerPorId(id)
                .map(usuario -> {
                    usuarioService.eliminar(id);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
