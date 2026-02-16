package com.assainissement.service;

import com.assainissement.dto.ClientDTO;
import com.assainissement.dto.PaymentDTO;
import com.assainissement.entity.*;
import com.assainissement.repository.ClientRepository;
import com.assainissement.repository.MissionRepository;
import com.assainissement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {
    
    private final ClientRepository clientRepository;
    private final MissionRepository missionRepository;
    private final PaymentRepository paymentRepository;
    
    public List<ClientDTO> findAllClients() {
        return clientRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<ClientDTO> findActiveClients() {
        return clientRepository.findByActiveTrue().stream()
                .map(this::toDTOLight)
                .collect(Collectors.toList());
    }
    
    public ClientDTO findById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        return toDTO(client);
    }
    
    public List<ClientDTO> searchByName(String search) {
        return clientRepository.searchByName(search).stream()
                .map(this::toDTOLight)
                .collect(Collectors.toList());
    }
    
    public List<ClientDTO> findByType(ClientType type) {
        return clientRepository.findByType(type).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ClientDTO createClient(ClientDTO dto) {
        Client client = Client.builder()
                .name(dto.getName())
                .type(dto.getType() != null ? dto.getType() : ClientType.PARTICULIER)
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .postalCode(dto.getPostalCode())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .siret(dto.getSiret())
                .vatNumber(dto.getVatNumber())
                .billingAddress(dto.getBillingAddress())
                .hasContract(dto.isHasContract())
                .contractStartDate(dto.getContractStartDate())
                .contractEndDate(dto.getContractEndDate())
                .notes(dto.getNotes())
                .build();
        
        return toDTO(clientRepository.save(client));
    }
    
    @Transactional
    public ClientDTO updateClient(Long id, ClientDTO dto) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        
        client.setName(dto.getName());
        client.setType(dto.getType());
        client.setContactPerson(dto.getContactPerson());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        client.setAddress(dto.getAddress());
        client.setCity(dto.getCity());
        client.setPostalCode(dto.getPostalCode());
        client.setLatitude(dto.getLatitude());
        client.setLongitude(dto.getLongitude());
        client.setSiret(dto.getSiret());
        client.setVatNumber(dto.getVatNumber());
        client.setBillingAddress(dto.getBillingAddress());
        client.setHasContract(dto.isHasContract());
        client.setContractStartDate(dto.getContractStartDate());
        client.setContractEndDate(dto.getContractEndDate());
        client.setNotes(dto.getNotes());
        client.setActive(dto.isActive());
        
        return toDTO(clientRepository.save(client));
    }
    
    @Transactional
    public void deactivateClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        client.setActive(false);
        clientRepository.save(client);
    }
    
    @Transactional
    public void activateClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        client.setActive(true);
        clientRepository.save(client);
    }
    
    // ─── Payments ────────────────────────────────────────────────────
    
    public List<PaymentDTO> getClientPayments(Long clientId) {
        return paymentRepository.findByClientId(clientId).stream()
                .map(this::toPaymentDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PaymentDTO createPayment(PaymentDTO dto) {
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        
        Mission mission = null;
        if (dto.getMissionId() != null) {
            mission = missionRepository.findById(dto.getMissionId())
                    .orElseThrow(() -> new RuntimeException("Mission not found"));
        }
        
        Payment payment = Payment.builder()
                .client(client)
                .mission(mission)
                .amount(dto.getAmount())
                .status(dto.getStatus() != null ? dto.getStatus() : PaymentStatus.PENDING)
                .method(dto.getMethod())
                .reference(dto.getReference())
                .invoiceNumber(dto.getInvoiceNumber())
                .notes(dto.getNotes())
                .paymentDate(dto.getPaymentDate())
                .dueDate(dto.getDueDate())
                .build();
        
        return toPaymentDTO(paymentRepository.save(payment));
    }
    
    @Transactional
    public PaymentDTO updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(status);
        return toPaymentDTO(paymentRepository.save(payment));
    }
    
    // ─── Mission queries by client ──────────────────────────────────
    
    @SuppressWarnings("unused")
    public List<Mission> getClientMissions(Long clientId) {
        return missionRepository.findByClientId(clientId);
    }
    
    // ─── Mapping ────────────────────────────────────────────────────
    
    public ClientDTO toDTO(Client client) {
        List<Mission> missions = missionRepository.findByClientId(client.getId());
        BigDecimal totalPaid = paymentRepository.sumPaidByClient(client.getId());
        BigDecimal totalDue = paymentRepository.sumDueByClient(client.getId());
        
        long completed = missions.stream()
                .filter(m -> m.getStatus() == MissionStatus.APPROVED || m.getStatus() == MissionStatus.COMPLETED)
                .count();
        long inProgress = missions.stream()
                .filter(m -> m.getStatus() == MissionStatus.IN_PROGRESS 
                        || m.getStatus() == MissionStatus.ON_THE_WAY 
                        || m.getStatus() == MissionStatus.ON_SITE
                        || m.getStatus() == MissionStatus.ASSIGNED)
                .count();
        
        return ClientDTO.builder()
                .id(client.getId())
                .name(client.getName())
                .type(client.getType())
                .contactPerson(client.getContactPerson())
                .email(client.getEmail())
                .phone(client.getPhone())
                .address(client.getAddress())
                .city(client.getCity())
                .postalCode(client.getPostalCode())
                .latitude(client.getLatitude())
                .longitude(client.getLongitude())
                .siret(client.getSiret())
                .vatNumber(client.getVatNumber())
                .billingAddress(client.getBillingAddress())
                .hasContract(client.isHasContract())
                .contractStartDate(client.getContractStartDate())
                .contractEndDate(client.getContractEndDate())
                .notes(client.getNotes())
                .active(client.isActive())
                .totalMissions(missions.size())
                .completedMissions((int) completed)
                .inProgressMissions((int) inProgress)
                .totalPaid(totalPaid)
                .totalDue(totalDue)
                .balance(totalDue.subtract(totalPaid))
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .build();
    }
    
    private ClientDTO toDTOLight(Client client) {
        return ClientDTO.builder()
                .id(client.getId())
                .name(client.getName())
                .type(client.getType())
                .contactPerson(client.getContactPerson())
                .email(client.getEmail())
                .phone(client.getPhone())
                .address(client.getAddress())
                .city(client.getCity())
                .active(client.isActive())
                .build();
    }
    
    private PaymentDTO toPaymentDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .clientId(payment.getClient().getId())
                .clientName(payment.getClient().getName())
                .missionId(payment.getMission() != null ? payment.getMission().getId() : null)
                .missionTitle(payment.getMission() != null ? payment.getMission().getTitle() : null)
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .reference(payment.getReference())
                .invoiceNumber(payment.getInvoiceNumber())
                .notes(payment.getNotes())
                .paymentDate(payment.getPaymentDate())
                .dueDate(payment.getDueDate())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
