package com.gestion.gym.controller;

import com.gestion.gym.model.VentaProducto;
import com.gestion.gym.model.VentaProductoDTO;
import com.gestion.gym.service.VentaProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venta-producto")
public class VentaProductoController {

    @Autowired
    private VentaProductoService ventaProductoService;

    @PostMapping("/asociar")
    public ResponseEntity<VentaProducto> asociarProductoAVenta(
            @RequestParam int ventaId,
            @RequestParam int productoId,
            @RequestParam int cantidad) {
        return new ResponseEntity<>(ventaProductoService.asociarProductoAVenta(ventaId, productoId, cantidad), HttpStatus.CREATED);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<VentaProductoDTO>> obtenerTodos() {
        return new ResponseEntity<>(ventaProductoService.obtenerTodos(), HttpStatus.OK);
    }
}
