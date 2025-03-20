package com.gestion.gym.controller;

import com.gestion.gym.model.Pago;
import com.gestion.gym.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:3000")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @GetMapping("/listar")
    public ResponseEntity<List<Pago>> obtenerTodos() {
        return new ResponseEntity<>(pagoService.obtenerTodos(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> obtenerPorId(@PathVariable int id) {
        Optional<Pago> pago = pagoService.obtenerPorId(id);
        return pago.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/crear")
    public ResponseEntity<Pago> crear(@RequestBody Pago pago) {
        return new ResponseEntity<>(pagoService.guardar(pago), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pago> actualizar(@PathVariable int id, @RequestBody Pago pago) {
        return pagoService.obtenerPorId(id)
                .map(p -> {
                    pago.setId_pago(id);
                    return new ResponseEntity<>(pagoService.guardar(pago), HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        return pagoService.obtenerPorId(id)
                .map(p -> {
                    pagoService.eliminar(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
