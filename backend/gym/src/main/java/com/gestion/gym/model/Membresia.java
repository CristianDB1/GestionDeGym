package com.gestion.gym.model;

import jakarta.persistence.*;

@Entity
@Table(name = "membresias")
public class Membresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_membresia;

    private String nombre;
    private double precio;
    private int duracionDias;

    private boolean activa;

    public Membresia() {}

    public Membresia(int id_membresia, String nombre, double precio, int duracionDias, boolean activa) {
        this.id_membresia = id_membresia;
        this.nombre = nombre;
        this.precio = precio;
        this.duracionDias = duracionDias;
        this.activa = activa;
    }

    public int getId_membresia() {
        return id_membresia;
    }

    public void setId_membresia(int id_membresia) {
        this.id_membresia = id_membresia;
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

    public int getDuracionDias() {
        return duracionDias;
    }

    public void setDuracionDias(int duracionDias) {
        this.duracionDias = duracionDias;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
