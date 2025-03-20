package com.gestion.gym.controller;

import com.gestion.gym.model.ClienteMembresia;
import com.gestion.gym.service.ClienteMembresiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente-membresia")
@CrossOrigin(origins = "http://localhost:3000")
public class ClienteMembresiaController {

    @Autowired
    private ClienteMembresiaService clienteMembresiaService;

    @PostMapping("/asignar")
    public ResponseEntity<ClienteMembresia> asignarMembresia(@RequestBody ClienteMembresia clienteMembresia) {
        return new ResponseEntity<>(clienteMembresiaService.asignarMembresia(clienteMembresia), HttpStatus.CREATED);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<ClienteMembresia>> obtenerTodas() {
        return new ResponseEntity<>(clienteMembresiaService.obtenerTodas(), HttpStatus.OK);
    }
}
