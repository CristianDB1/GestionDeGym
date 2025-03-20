package com.gestion.gym.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_pago;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private double monto;
    private Date fechaPago;

    @OneToMany(mappedBy = "pago", cascade = CascadeType.ALL)
    private List<PagoMembresia> pagosMembresias;

    public Pago() {}

    public Pago(Cliente cliente, double monto, Date fechaPago) {
        this.cliente = cliente;
        this.monto = monto;
        this.fechaPago = fechaPago;
    }

    public int getId_pago() {
        return id_pago;
    }

    public void setId_pago(int id_pago) {
        this.id_pago = id_pago;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }

    public Date getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(Date fechaPago) {
        this.fechaPago = fechaPago;
    }
}
