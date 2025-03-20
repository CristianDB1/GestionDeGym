package com.gestion.gym.model;

public class VentaProductoDTO {
    private int id;
    private Venta venta;
    private Producto producto;
    private int cantidad;
    private double subtotal;

    public VentaProductoDTO() {

    }

    public VentaProductoDTO(int id, Venta venta, Producto producto, int cantidad, double subtotal) {
        this.id = id;
        this.venta = venta;
        this.producto = producto;
        this.cantidad = cantidad;
        this.subtotal = subtotal;
    }

    public int getId() {
        return id;
    }

    public Venta getVenta() {
        return venta;
    }

    public Producto getProducto() {
        return producto;
    }

    public int getCantidad() {
        return cantidad;
    }

    public double getSubtotal() {
        return subtotal;
    }
}
