package com.gestion.gym.controller;

import com.gestion.gym.model.Compra;
import com.gestion.gym.service.CompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class CompraController {

    @Autowired
    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Compra>> listar() {
        return ResponseEntity.ok(compraService.listarCompras());
    }

    @PostMapping("/registrarCompra")
    public ResponseEntity<Compra> registrarCompra(@RequestBody Compra compra) {
        Compra guardada = compraService.guardarCompra(compra);
        return ResponseEntity.ok(guardada);
    }
}
