package com.gestion.gym.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "ventas")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_venta;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    private Date fechaVenta;
    private double total;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    private List<VentaProducto> productosVendidos;

    public Venta() {}

    public Venta(Cliente cliente, Date fechaVenta, double total) {
        this.cliente = cliente;
        this.fechaVenta = fechaVenta;
        this.total = total;
    }

    public int getId_venta() {
        return id_venta;
    }

    public void setId_venta(int id_venta) {
        this.id_venta = id_venta;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Date getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(Date fechaVenta) {
        this.fechaVenta = fechaVenta;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public List<VentaProducto> getProductosVendidos() {
        return productosVendidos;
    }

    public void setProductosVendidos(List<VentaProducto> productosVendidos) {
        this.productosVendidos = productosVendidos;
    }
}
