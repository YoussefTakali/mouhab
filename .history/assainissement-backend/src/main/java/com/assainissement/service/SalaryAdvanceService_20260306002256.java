package com.assainissement.service;

import com.assainissement.dto.SalaryAdvanceDTO;
import com.assainissement.entity.*;
import com.assainissement.repository.EmployeeRepository;
import com.assainissement.repository.SalaryAdvanceRepository;
import com.assainissement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryAdvanceService {
    
    private static final int MINIMUM_DAYS_IN_ADVANCE = 15;
    
    private final SalaryAdvanceRepository salaryAdvanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    
    public SalaryAdvance findById(Long id) {
        return salaryAdvanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary advance not found with id: " + id));
    }
    
    public List<SalaryAdvanceDTO> findAll() {
        return salaryAdvanceRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<SalaryAdvanceDTO> findByEmployee(Long employeeId) {
        return salaryAdvanceRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<SalaryAdvanceDTO> findPendingAdvances() {
        return salaryAdvanceRepository.findPendingAdvances().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SalaryAdvanceDTO createSalaryAdvance(SalaryAdvanceDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Validate: must be at least 15 days in advance
        LocalDate today = LocalDate.now();
        long daysUntilRequested = ChronoUnit.DAYS.between(today, dto.getRequestedDate());
        
        if (daysUntilRequested < MINIMUM_DAYS_IN_ADVANCE) {
            throw new RuntimeException(
                    "Les avances sur salaire doivent être demandées au moins " + 
                    MINIMUM_DAYS_IN_ADVANCE + " jours à l'avance. " +
                    "Vous avez demandé pour dans " + daysUntilRequested + " jours."
            );
        }
        
        SalaryAdvance advance = SalaryAdvance.builder()
                .employee(employee)
                .amount(dto.getAmount())
                .requestedDate(dto.getRequestedDate())
                .reason(dto.getReason())
                .status(SalaryAdvanceStatus.PENDING)
                .build();
        
        return toDTO(salaryAdvanceRepository.save(advance));
    }
    
    @Transactional
    public SalaryAdvanceDTO approveSalaryAdvance(Long advanceId, Long approvedByUserId) {
        SalaryAdvance advance = findById(advanceId);
        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        advance.setStatus(SalaryAdvanceStatus.APPROVED);
        advance.setApprovedBy(approvedBy);
        advance.setApprovedAt(LocalDateTime.now());
        
        return toDTO(salaryAdvanceRepository.save(advance));
    }
    
    @Transactional
    public SalaryAdvanceDTO rejectSalaryAdvance(Long advanceId, Long rejectedByUserId, String reason) {
        SalaryAdvance advance = findById(advanceId);
        User rejectedBy = userRepository.findById(rejectedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        advance.setStatus(SalaryAdvanceStatus.REJECTED);
        advance.setApprovedBy(rejectedBy);
        advance.setApprovedAt(LocalDateTime.now());
        advance.setRejectionReason(reason);
        
        return toDTO(salaryAdvanceRepository.save(advance));
    }
    
    @Transactional
    public SalaryAdvanceDTO markAsPaid(Long advanceId) {
        SalaryAdvance advance = findById(advanceId);
        
        if (advance.getStatus() != SalaryAdvanceStatus.APPROVED) {
            throw new RuntimeException("Only approved advances can be marked as paid");
        }
        
        advance.setStatus(SalaryAdvanceStatus.PAID);
        advance.setPaidDate(LocalDate.now());
        
        return toDTO(salaryAdvanceRepository.save(advance));
    }
    
    private SalaryAdvanceDTO toDTO(SalaryAdvance advance) {
        return SalaryAdvanceDTO.builder()
                .id(advance.getId())
                .employeeId(advance.getEmployee().getId())
                .employeeName(advance.getEmployee().getUser().getFullName())
                .amount(advance.getAmount())
                .requestedDate(advance.getRequestedDate())
                .reason(advance.getReason())
                .status(advance.getStatus())
                .approvedById(advance.getApprovedBy() != null ? advance.getApprovedBy().getId() : null)
                .approvedByName(advance.getApprovedBy() != null ? advance.getApprovedBy().getFullName() : null)
                .approvedAt(advance.getApprovedAt())
                .rejectionReason(advance.getRejectionReason())
                .paidDate(advance.getPaidDate())
                .createdAt(advance.getCreatedAt())
                .build();
    }
}
