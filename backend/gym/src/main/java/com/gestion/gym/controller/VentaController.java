package com.gestion.gym.controller;

import com.gestion.gym.model.Venta;
import com.gestion.gym.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @PostMapping("/crear")
    public ResponseEntity<Venta> registrarVenta(@RequestBody Venta venta) {
        Venta nueva = ventaService.guardarVenta(venta);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Venta>> listarVentas() {
        return ResponseEntity.ok(ventaService.listarVentas());
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarVenta(@PathVariable int id) {
        return ventaService.eliminarVenta(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }


}
