package com.assainissement.controller;

import com.assainissement.dto.ClientDTO;
import com.assainissement.dto.MissionDTO;
import com.assainissement.dto.PaymentDTO;
import com.assainissement.entity.ClientType;
import com.assainissement.entity.PaymentStatus;
import com.assainissement.service.ClientService;
import com.assainissement.service.MissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientController {
    
    private final ClientService clientService;
    private final MissionService missionService;
    
    @GetMapping
    public ResponseEntity<List<ClientDTO>> getAllClients() {
        return ResponseEntity.ok(clientService.findAllClients());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<ClientDTO>> getActiveClients() {
        return ResponseEntity.ok(clientService.findActiveClients());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClient(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.findById(id));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ClientDTO>> searchClients(@RequestParam String q) {
        return ResponseEntity.ok(clientService.searchByName(q));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ClientDTO>> getClientsByType(@PathVariable ClientType type) {
        return ResponseEntity.ok(clientService.findByType(type));
    }
    
    @PostMapping
    public ResponseEntity<ClientDTO> createClient(@RequestBody ClientDTO clientDTO) {
        return ResponseEntity.ok(clientService.createClient(clientDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ClientDTO> updateClient(@PathVariable Long id, @RequestBody ClientDTO clientDTO) {
        return ResponseEntity.ok(clientService.updateClient(id, clientDTO));
    }
    
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateClient(@PathVariable Long id) {
        clientService.deactivateClient(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateClient(@PathVariable Long id) {
        clientService.activateClient(id);
        return ResponseEntity.ok().build();
    }
    
    // ─── Client Missions ────────────────────────────────────────────
    
    @GetMapping("/{id}/missions")
    public ResponseEntity<List<MissionDTO>> getClientMissions(@PathVariable Long id) {
        List<MissionDTO> missions = clientService.getClientMissions(id).stream()
                .map(missionService::toDTO)
                .toList();
        return ResponseEntity.ok(missions);
    }
    
    // ─── Client Payments ────────────────────────────────────────────
    
    @GetMapping("/{id}/payments")
    public ResponseEntity<List<PaymentDTO>> getClientPayments(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientPayments(id));
    }
    
    @PostMapping("/{id}/payments")
    public ResponseEntity<PaymentDTO> createPayment(@PathVariable Long id, @RequestBody PaymentDTO paymentDTO) {
        paymentDTO.setClientId(id);
        return ResponseEntity.ok(clientService.createPayment(paymentDTO));
    }
    
    @PutMapping("/payments/{paymentId}/status")
    public ResponseEntity<PaymentDTO> updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> request) {
        PaymentStatus status = PaymentStatus.valueOf(request.get("status"));
        return ResponseEntity.ok(clientService.updatePaymentStatus(paymentId, status));
    }
}
