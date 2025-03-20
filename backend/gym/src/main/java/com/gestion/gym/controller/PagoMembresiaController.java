package com.gestion.gym.controller;

import com.gestion.gym.model.PagoMembresia;
import com.gestion.gym.service.PagoMembresiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pago-membresia")
@CrossOrigin(origins = "http://localhost:3000")
public class PagoMembresiaController {

    @Autowired
    private PagoMembresiaService pagoMembresiaService;

    @PostMapping("/registrar")
    public ResponseEntity<PagoMembresia> registrarPago(@RequestBody PagoMembresia pagoMembresia) {
        return new ResponseEntity<>(pagoMembresiaService.registrarPagoMembresia(pagoMembresia), HttpStatus.CREATED);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<PagoMembresia>> obtenerTodos() {
        return new ResponseEntity<>(pagoMembresiaService.obtenerTodos(), HttpStatus.OK);
    }
}
