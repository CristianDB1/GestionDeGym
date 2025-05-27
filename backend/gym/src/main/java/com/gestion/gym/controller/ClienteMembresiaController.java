package com.gestion.gym.controller;

import com.gestion.gym.model.ClienteMembresia;
import com.gestion.gym.service.ClienteMembresiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/membresiasCliente")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ClienteMembresiaController {

    @Autowired
    private ClienteMembresiaService clienteMembresiaService;

    @PostMapping("/asignar")
    public ResponseEntity<ClienteMembresia> asignar(@RequestParam int clienteId, @RequestParam int membresiaId) {
        ClienteMembresia asignada = clienteMembresiaService.asignarMembresia(clienteId, membresiaId);
        return ResponseEntity.status(HttpStatus.CREATED).body(asignada);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<ClienteMembresia>> listar() {
        return ResponseEntity.ok(clienteMembresiaService.listarTodas());
    }
}
