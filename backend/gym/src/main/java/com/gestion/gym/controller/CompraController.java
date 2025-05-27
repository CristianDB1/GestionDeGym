package com.gestion.gym.controller;


import com.gestion.gym.model.Compra;
import com.gestion.gym.service.CompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class CompraController {

    @Autowired
    private CompraService compraService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Compra compra){
        try {
            Compra nuevaCompra = compraService.registrarCompra(compra);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCompra);
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Compra>> listar(){
        return ResponseEntity.ok(compraService.listarCompras());
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        return compraService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        compraService.eliminarCompra(id);
        return ResponseEntity.noContent().build();
    }
}
