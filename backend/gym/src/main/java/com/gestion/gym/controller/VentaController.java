package com.gestion.gym.controller;

import com.gestion.gym.model.Venta;
import com.gestion.gym.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Venta venta) {
        try {
            Venta nuevaVenta = ventaService.registrarVenta(venta);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaVenta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Venta>> listar() {
        return ResponseEntity.ok(ventaService.listarVentas());
    }

    @GetMapping("/detalle/{id}")
    public ResponseEntity<?> detalle(@PathVariable int id) {

        Optional<Venta> ventaOpt = ventaService.buscarPorId(id);

        if (ventaOpt.isEmpty()) return ResponseEntity.notFound().build();

        Venta venta = ventaOpt.get();

        List<Map<String, Object>> detalle = venta.getVentaProductos().stream().map(vp -> {
            Map<String, Object> d = new HashMap<>();
            d.put("producto", vp.getProducto().getNombre());
            d.put("cantidad", vp.getCantidad());
            d.put("precioUnitario", vp.getPrecio_unitario());
            d.put("subtotal", vp.getCantidad() * vp.getPrecio_unitario());
            return d;
        }).toList();

        double total = detalle.stream()
                .mapToDouble(i -> (double) i.get("subtotal"))
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("fecha", venta.getFecha());
        response.put("ventaId", venta.getId_venta());
        response.put("detalle", detalle);
        response.put("total", total);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        ventaService.eliminarVenta(id);
        return ResponseEntity.noContent().build();
    }
}
