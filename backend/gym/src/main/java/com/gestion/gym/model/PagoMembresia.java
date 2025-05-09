package com.gestion.gym.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "pago_membresia")
public class PagoMembresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_pago_membresia;

    @ManyToOne
    @JoinColumn(name = "cliente_membresia_id")
    private ClienteMembresia clienteMembresia;

    private LocalDate fechaPago;
    private double monto;

    public PagoMembresia(){}

    public PagoMembresia(int id_pago_membresia, ClienteMembresia clienteMembresia, LocalDate fechaPago, double monto) {
        this.id_pago_membresia = id_pago_membresia;
        this.clienteMembresia = clienteMembresia;
        this.fechaPago = fechaPago;
        this.monto = monto;
    }

    public int getId_pago_membresia() {
        return id_pago_membresia;
    }

    public void setId_pago_membresia(int id_pago_membresia) {
        this.id_pago_membresia = id_pago_membresia;
    }

    public ClienteMembresia getClienteMembresia() {
        return clienteMembresia;
    }

    public void setClienteMembresia(ClienteMembresia clienteMembresia) {
        this.clienteMembresia = clienteMembresia;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }
}
