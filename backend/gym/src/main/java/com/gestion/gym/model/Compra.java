package com.gestion.gym.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "compras")
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_compra;

    private LocalDate fecha;

    @OneToMany(mappedBy = "compra",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompraProducto> compraProductos;

    public Compra() {}

    public Compra(int id_compra, LocalDate fecha, List<CompraProducto> compraProductos) {
        this.id_compra = id_compra;
        this.fecha = fecha;
        this.compraProductos = compraProductos;
    }

    public int getId_compra() {
        return id_compra;
    }

    public void setId_compra(int id_compra) {
        this.id_compra = id_compra;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public List<CompraProducto> getCompraProductos() {
        return compraProductos;
    }

    public void setCompraProductos(List<CompraProducto> compraProductos) {
        this.compraProductos = compraProductos;
    }
}
