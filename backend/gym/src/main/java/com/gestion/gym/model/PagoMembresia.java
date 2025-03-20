package com.gestion.gym.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pago_membresia")
public class PagoMembresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "pago_id")
    private Pago pago;

    @ManyToOne
    @JoinColumn(name = "membresia_id")
    private Membresia membresia;

    public PagoMembresia() {
    }

    public PagoMembresia(Pago pago, Membresia membresia) {
        this.pago = pago;
        this.membresia = membresia;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    public Membresia getMembresia() {
        return membresia;
    }

    public void setMembresia(Membresia membresia) {
        this.membresia = membresia;
    }
}
