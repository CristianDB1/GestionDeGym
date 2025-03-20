package com.gestion.gym.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_producto;

    private String nombre;
    private double precio;
    private int stock;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<VentaProducto> ventas;

    public Producto() {}

    public Producto(String nombre, double precio, int stock) {
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }

    public int getId_producto() {
        return id_producto;
    }

    public void setId_producto(int id_producto) {
        this.id_producto = id_producto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public List<VentaProducto> getVentas() {
        return ventas;
    }

    public void setVentas(List<VentaProducto> ventas) {
        this.ventas = ventas;
    }
}
