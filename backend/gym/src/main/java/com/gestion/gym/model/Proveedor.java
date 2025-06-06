package com.gestion.gym.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "proveedor")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_proveedor;

    private String nombre;
    private String telefono;
    private String direccion;

    @OneToMany(mappedBy = "proveedor",cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CompraProducto> productosComprados;


    public Proveedor() {}

    public Proveedor(int id_proveedor, String nombre, String telefono, String direccion, List<CompraProducto> productosComprados) {
        this.id_proveedor = id_proveedor;
        this.nombre = nombre;
        this.telefono = telefono;
        this.direccion = direccion;
        this.productosComprados = productosComprados;
    }

    public int getId_proveedor() {
        return id_proveedor;
    }

    public void setId_proveedor(int id_proveedor) {
        this.id_proveedor = id_proveedor;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public List<CompraProducto> getProductosComprados() {
        return productosComprados;
    }

    public void setProductosComprados(List<CompraProducto> productosComprados) {
        this.productosComprados = productosComprados;
    }
}
