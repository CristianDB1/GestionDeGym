package com.gestion.gym.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "membresias")
public class Membresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_membresia;

    private String nombre;
    private double precio;
    private int duracionDias;

    @OneToMany(mappedBy = "membresia", cascade = CascadeType.ALL)
    private List<ClienteMembresia> clientes;

    @OneToMany(mappedBy = "membresia", cascade = CascadeType.ALL)
    private List<PagoMembresia> pagos;

    public Membresia() {}

    public Membresia(String nombre, double precio, int duracionDias) {
        this.nombre = nombre;
        this.precio = precio;
        this.duracionDias = duracionDias;
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

    public List<ClienteMembresia> getClientes() {
        return clientes;
    }

    public void setClientes(List<ClienteMembresia> clientes) {
        this.clientes = clientes;
    }

    public List<PagoMembresia> getPagos() {
        return pagos;
    }

    public void setPagos(List<PagoMembresia> pagos) {
        this.pagos = pagos;
    }
}
