package com.gestion.gym.service;

import com.gestion.gym.model.ClienteMembresia;
import com.gestion.gym.model.PagoMembresia;
import com.gestion.gym.repository.ClienteMembresiaRepository;
import com.gestion.gym.repository.PagoMembresiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PagoMembresiaService {

    @Autowired
    private PagoMembresiaRepository pagoMembresiaRepository;

    @Autowired
    private ClienteMembresiaRepository clienteMembresiaRepository;

    public PagoMembresia registrarPago(int clienteMembresiaId, double monto) {
        ClienteMembresia cm = clienteMembresiaRepository.findById(clienteMembresiaId)
                .orElseThrow(() -> new RuntimeException("ClienteMembresia no encontrada"));

        PagoMembresia pago = new PagoMembresia();
        pago.setClienteMembresia(cm);
        pago.setMonto(monto);
        pago.setFechaPago(LocalDate.now());

        return pagoMembresiaRepository.save(pago);
    }

    public List<PagoMembresia> listarPagos() {
        return pagoMembresiaRepository.findAll();
    }
}
