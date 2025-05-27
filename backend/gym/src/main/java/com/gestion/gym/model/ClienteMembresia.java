package com.gestion.gym.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name = "cliente_membresia")
public class ClienteMembresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_cliente_membresia;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties("membresias")
    private Cliente cliente;

    @ManyToOne()
    @JoinColumn(name = "membresia_id")
    private Membresia membresia;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    private boolean activa;

    public ClienteMembresia() {}

    public ClienteMembresia(int id_cliente_membresia, Cliente cliente, Membresia membresia, LocalDate fechaInicio, LocalDate fechaFin, boolean activa) {
        this.id_cliente_membresia = id_cliente_membresia;
        this.cliente = cliente;
        this.membresia = membresia;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.activa = activa;
    }

    public int getId_cliente_membresia() {
        return id_cliente_membresia;
    }

    public void setId_cliente_membresia(int id_cliente_membresia) {
        this.id_cliente_membresia = id_cliente_membresia;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Membresia getMembresia() {
        return membresia;
    }

    public void setMembresia(Membresia membresia) {
        this.membresia = membresia;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
