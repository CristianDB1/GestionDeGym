package com.gestion.gym.service;

import com.gestion.gym.model.Cliente;
import com.gestion.gym.model.ClienteMembresia;
import com.gestion.gym.model.Membresia;
import com.gestion.gym.repository.ClienteMembresiaRepository;
import com.gestion.gym.repository.ClienteRepository;
import com.gestion.gym.repository.MembresiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ClienteMembresiaService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ClienteMembresiaRepository clienteMembresiaRepository;

    @Autowired
    private MembresiaRepository membresiaRepository;

    public ClienteMembresia asignarMembresia(int clienteId, int membresiaId) {
        Membresia membresia = membresiaRepository.findById(membresiaId)
                .orElseThrow(() -> new RuntimeException("Membresía no encontrada"));

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        ClienteMembresia cm = new ClienteMembresia();
        cm.setCliente(cliente);
        cm.setMembresia(membresia);

        LocalDate inicio = LocalDate.now();
        LocalDate fin = inicio.plusDays(membresia.getDuracionDias());

        cm.setFechaInicio(inicio);
        cm.setFechaFin(fin);
        cm.setActiva(true);

        return clienteMembresiaRepository.save(cm);
    }

    public List<ClienteMembresia> listarTodas() {
        return clienteMembresiaRepository.findAll();
    }
}
