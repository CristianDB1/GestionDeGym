package com.gestion.gym.controller;


import com.gestion.gym.model.Compra;
import com.gestion.gym.model.CompraProducto;
import com.gestion.gym.service.CompraService;
import com.gestion.gym.service.compraProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class CompraController {

    @Autowired
    private CompraService compraService;

    @Autowired
    private compraProductoService compraProductoService;

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
    public ResponseEntity<?> listarComprasAgrupadas() {
        List<Compra> compras = compraService.obtenerTodas();

        List<Map<String, Object>> resultado = compras.stream().map(compra -> {
            Map<String, Object> compraMap = new HashMap<>();
            compraMap.put("id", compra.getId_compra());
            compraMap.put("fecha", compra.getFecha());

            List<CompraProducto> detalles = compraProductoService.obtenerPorCompra(compra);

            List<Map<String, Object>> productos = detalles.stream().map(cp -> {
                Map<String, Object> detalle = new HashMap<>();
                detalle.put("producto", cp.getProducto().getNombre());
                detalle.put("proveedor", cp.getProveedor().getNombre());
                detalle.put("cantidad", cp.getCantidad());
                detalle.put("precio", cp.getPrecioCompra());
                detalle.put("subtotal", cp.getCantidad() * cp.getPrecioCompra());
                return detalle;
            }).toList();

            compraMap.put("productos", productos);
            double total = productos.stream().mapToDouble(p -> (double) p.get("subtotal")).sum();
            compraMap.put("total", total);

            return compraMap;
        }).toList();

        return ResponseEntity.ok(resultado);
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

    @GetMapping("/detalle/{id}")
    public ResponseEntity<?> obtenerDetalle(@PathVariable int id) {
        Optional<Compra> compraOpt = compraService.buscarPorId(id);

        if (compraOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Compra compra = compraOpt.get();
        List<Map<String, Object>> detalle = new ArrayList<>();
        double total = 0.0;

        for (CompraProducto cp : compra.getCompraProductos()) {
            Map<String, Object> item = new HashMap<>();
            item.put("producto", cp.getProducto().getNombre());
            item.put("proveedor", cp.getProveedor().getNombre());
            item.put("cantidad", cp.getCantidad());
            item.put("precioUnitario", cp.getPrecioCompra());
            item.put("subtotal", cp.getCantidad() * cp.getPrecioCompra());

            total += cp.getCantidad() * cp.getPrecioCompra();
            detalle.add(item);
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("compraId", compra.getId_compra());
        respuesta.put("fecha", compra.getFecha());
        respuesta.put("total", total);
        respuesta.put("detalle", detalle);

        return ResponseEntity.ok(respuesta);
    }


}
