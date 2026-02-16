package com.assainissement.service;

import com.assainissement.dto.AbsenceDTO;
import com.assainissement.entity.*;
import com.assainissement.repository.AbsenceRepository;
import com.assainissement.repository.EmployeeRepository;
import com.assainissement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbsenceService {
    
    private final AbsenceRepository absenceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;
    
    public Absence findById(Long id) {
        return absenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Absence not found with id: " + id));
    }
    
    public List<AbsenceDTO> findAll() {
        return absenceRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<AbsenceDTO> findByEmployee(Long employeeId) {
        return absenceRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<AbsenceDTO> findByStatus(AbsenceStatus status) {
        return absenceRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<AbsenceDTO> findPendingAbsences() {
        return findByStatus(AbsenceStatus.PENDING);
    }
    
    public List<AbsenceDTO> findAbsencesOnDate(LocalDate date) {
        return absenceRepository.findAbsencesOnDate(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<AbsenceDTO> findAbsencesBetween(LocalDate start, LocalDate end) {
        return absenceRepository.findAbsencesBetween(start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public boolean isEmployeeAbsent(Long employeeId, LocalDate date) {
        return !absenceRepository.findApprovedAbsenceForEmployeeOnDate(employeeId, date).isEmpty();
    }
    
    @Transactional
    public AbsenceDTO createAbsence(AbsenceDTO absenceDTO) {
        Employee employee = employeeRepository.findById(absenceDTO.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Absence absence = Absence.builder()
                .employee(employee)
                .type(absenceDTO.getType())
                .startDate(absenceDTO.getStartDate())
                .endDate(absenceDTO.getEndDate())
                .reason(absenceDTO.getReason())
                .notes(absenceDTO.getNotes())
                .status(AbsenceStatus.PENDING)
                .build();
        
        return toDTO(absenceRepository.save(absence));
    }
    
    @Transactional
    public AbsenceDTO approveAbsence(Long absenceId, Long approvedByUserId) {
        Absence absence = findById(absenceId);
        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        absence.setStatus(AbsenceStatus.APPROVED);
        absence.setApprovedBy(approvedBy);
        absence.setApprovedAt(java.time.LocalDateTime.now());
        
        // Apply points penalty for unjustified absence
        if (absence.getType() == AbsenceType.ABSENCE_INJUSTIFIEE) {
            pointsService.deductPoints(absence.getEmployee().getId(), null, 
                    PointTransactionType.UNJUSTIFIED_ABSENCE);
            absence.setPointsPenalty(PointTransactionType.UNJUSTIFIED_ABSENCE.getDefaultPoints());
        }
        
        return toDTO(absenceRepository.save(absence));
    }
    
    @Transactional
    public AbsenceDTO rejectAbsence(Long absenceId, Long rejectedByUserId, String notes) {
        Absence absence = findById(absenceId);
        User rejectedBy = userRepository.findById(rejectedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        absence.setStatus(AbsenceStatus.REJECTED);
        absence.setApprovedBy(rejectedBy);
        absence.setApprovedAt(java.time.LocalDateTime.now());
        absence.setNotes(notes);
        
        return toDTO(absenceRepository.save(absence));
    }
    
    @Transactional
    public AbsenceDTO cancelAbsence(Long absenceId) {
        Absence absence = findById(absenceId);
        absence.setStatus(AbsenceStatus.CANCELLED);
        return toDTO(absenceRepository.save(absence));
    }
    
    public Long countUnjustifiedAbsences(Long employeeId) {
        return absenceRepository.countUnjustifiedAbsences(employeeId);
    }
    
    private AbsenceDTO toDTO(Absence absence) {
        return AbsenceDTO.builder()
                .id(absence.getId())
                .employeeId(absence.getEmployee().getId())
                .employeeName(absence.getEmployee().getUser().getFullName())
                .type(absence.getType())
                .startDate(absence.getStartDate())
                .endDate(absence.getEndDate())
                .reason(absence.getReason())
                .notes(absence.getNotes())
                .status(absence.getStatus())
                .documentPath(absence.getDocumentPath())
                .pointsPenalty(absence.getPointsPenalty())
                .approvedByName(absence.getApprovedBy() != null ? absence.getApprovedBy().getFullName() : null)
                .approvedAt(absence.getApprovedAt())
                .createdAt(absence.getCreatedAt())
                .build();
    }
}
