package com.gestion.gym.controller;

import com.gestion.gym.model.Rol;
import com.gestion.gym.service.RolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Rol>> obtenerTodosRoles() {
        List<Rol> roles = rolService.obtenerTodos();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable int id) {
        return rolService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearRol(@RequestBody Rol rol) {
        try {
            Rol nuevoRol = rolService.guardar(rol);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRol);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarRol(@PathVariable int id, @RequestBody Rol rol) {
        return rolService.obtenerPorId(id)
                .map(rolExistente -> {
                    rolExistente.setNombre(rol.getNombre());
                    rolExistente.setDescripcion(rol.getDescripcion());

                    Rol rolActualizado = rolService.guardar(rolExistente);
                    return ResponseEntity.ok(rolActualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminarRol(@PathVariable int id) {
        return rolService.obtenerPorId(id)
                .map(rol -> {
                    rolService.eliminar(id);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
