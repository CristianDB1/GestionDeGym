package com.gestion.gym.controller;

import com.gestion.gym.model.Venta;
import com.gestion.gym.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @GetMapping("/listar")
    public ResponseEntity<List<Venta>> obtenerTodas() {
        return new ResponseEntity<>(ventaService.obtenerTodas(), HttpStatus.OK);
    }

    @PostMapping("/crear")
    public ResponseEntity<Venta> crear(@RequestBody Venta venta) {
        return new ResponseEntity<>(ventaService.guardar(venta), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        ventaService.eliminar(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
