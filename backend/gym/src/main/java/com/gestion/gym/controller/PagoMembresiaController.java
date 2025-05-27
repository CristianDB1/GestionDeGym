package com.gestion.gym.controller;

import com.gestion.gym.model.PagoMembresia;
import com.gestion.gym.service.PagoMembresiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pagoMembresia")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class PagoMembresiaController {

    @Autowired
    private PagoMembresiaService pagoMembresiaService;

    @PostMapping("/registrar")
    public ResponseEntity<PagoMembresia> registrar(
            @RequestParam int clienteMembresiaId,
            @RequestParam double monto) {
        PagoMembresia pago = pagoMembresiaService.registrarPago(clienteMembresiaId, monto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pago);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<PagoMembresia>> listar() {
        return ResponseEntity.ok(pagoMembresiaService.listarPagos());
    }
}
