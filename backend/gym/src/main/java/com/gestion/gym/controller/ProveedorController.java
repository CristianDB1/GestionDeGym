package com.gestion.gym.controller;

import com.gestion.gym.model.Proveedor;
import com.gestion.gym.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    @GetMapping("/listar")
    public ResponseEntity<List<Proveedor>> listar() {
        return new ResponseEntity<>(proveedorService.obtenerTodos(), HttpStatus.OK);
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<Proveedor> obtenerProveedorPorId(@RequestParam int id) {
        Optional<Proveedor> proveedor = proveedorService.obtenerPorId(id);
        return proveedor.map(value-> new ResponseEntity<>(value, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/crear")
    public ResponseEntity<Proveedor> crear(@RequestBody Proveedor proveedor) {
        return new ResponseEntity<>(proveedorService.guardar(proveedor), HttpStatus.CREATED);
    }

    @PutMapping("/actualizar")
    public ResponseEntity<Proveedor> actualizarProveedor(@PathVariable int id,@RequestBody Proveedor proveedor) {
        return proveedorService.obtenerPorId(id)
                .map(proovedorExiste -> {
                    proveedor.setId_proveedor(id);
                    return new ResponseEntity<>(proveedorService.guardar(proveedor), HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable int id) {
        return proveedorService.obtenerPorId(id)
                .map(proveedor -> {
                    proveedorService.eliminar(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
