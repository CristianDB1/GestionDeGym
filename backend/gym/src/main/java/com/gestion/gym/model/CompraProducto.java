package com.gestion.gym.model;

import jakarta.persistence.*;

@Entity
@Table(name = "compra_producto")
public class CompraProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_compra_producto;

    @ManyToOne
    @JoinColumn(name = "compra_id")
    private Compra compra;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    private int cantidad;
    private double precioCompra;

    public CompraProducto(){}

    public CompraProducto(int id_compra_producto, Compra compra, Producto producto, Proveedor proveedor, int cantidad, double precioCompra) {
        this.id_compra_producto = id_compra_producto;
        this.compra = compra;
        this.producto = producto;
        this.proveedor = proveedor;
        this.cantidad = cantidad;
        this.precioCompra = precioCompra;
    }

    public int getId_compra_producto() {
        return id_compra_producto;
    }

    public void setId_compra_producto(int id_compra_producto) {
        this.id_compra_producto = id_compra_producto;
    }

    public Compra getCompra() {
        return compra;
    }

    public void setCompra(Compra compra) {
        this.compra = compra;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Proveedor getProveedor() {
        return proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(double precioCompra) {
        this.precioCompra = precioCompra;
    }
}
