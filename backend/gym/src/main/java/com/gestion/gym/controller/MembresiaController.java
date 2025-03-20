package com.gestion.gym.controller;

import com.gestion.gym.model.Membresia;
import com.gestion.gym.service.MembresiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/membresias")
@CrossOrigin(origins = "http://localhost:3000")
public class MembresiaController {

    @Autowired
    private MembresiaService membresiaService;

    @GetMapping("/listar")
    public ResponseEntity<List<Membresia>> obtenerTodas() {
        return new ResponseEntity<>(membresiaService.obtenerTodas(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Membresia> obtenerPorId(@PathVariable int id) {
        Optional<Membresia> membresia = membresiaService.obtenerPorId(id);
        return membresia.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/crear")
    public ResponseEntity<Membresia> crear(@RequestBody Membresia membresia) {
        return new ResponseEntity<>(membresiaService.guardar(membresia), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Membresia> actualizar(@PathVariable int id, @RequestBody Membresia membresia) {
        return membresiaService.obtenerPorId(id)
                .map(m -> {
                    membresia.setId_membresia(id);
                    return new ResponseEntity<>(membresiaService.guardar(membresia), HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        return membresiaService.obtenerPorId(id)
                .map(m -> {
                    membresiaService.eliminar(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
