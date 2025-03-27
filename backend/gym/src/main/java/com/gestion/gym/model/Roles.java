package com.gestion.gym.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "roles")
public class Roles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_roles;

    private String nombre;
    private String descripcion;

    @OneToMany(mappedBy = "roles", cascade = CascadeType.ALL)
    private List<Usuario> usuario;

    public Roles() {

    }

    public Roles(int id_roles, String nombre, String descripcion, List<Usuario> usuario) {
        this.id_roles = id_roles;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.usuario = usuario;
    }

    public int getId_roles() {
        return id_roles;
    }

    public void setId_roles(int id_roles) {
        this.id_roles = id_roles;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public List<Usuario> getUsuario() {
        return usuario;
    }

    public void setUsuario(List<Usuario> usuario) {
        this.usuario = usuario;
    }
}
