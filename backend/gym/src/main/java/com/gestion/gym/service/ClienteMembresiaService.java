package com.gestion.gym.service;

import com.gestion.gym.model.ClienteMembresia;
import com.gestion.gym.repository.ClienteMembresiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteMembresiaService {

    @Autowired
    private ClienteMembresiaRepository clienteMembresiaRepository;

    public ClienteMembresia asignarMembresia(ClienteMembresia clienteMembresia) {
        // Validar si el cliente ya tiene la misma membresía activa
        List<ClienteMembresia> membresiasActivas = clienteMembresiaRepository.findByCliente_IdCliente(clienteMembresia.getCliente().getIdCliente());

        for (ClienteMembresia cm : membresiasActivas) {
            if (cm.getMembresia().getId_membresia() == clienteMembresia.getMembresia().getId_membresia()) {
                throw new RuntimeException("El cliente ya tiene esta membresía activa.");
            }
        }

        return clienteMembresiaRepository.save(clienteMembresia);
    }

    public List<ClienteMembresia> obtenerTodas() {
        return clienteMembresiaRepository.findAll();
    }
}
