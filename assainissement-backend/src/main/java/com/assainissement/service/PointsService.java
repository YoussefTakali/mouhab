package com.assainissement.service;

import com.assainissement.dto.PointTransactionDTO;
import com.assainissement.entity.*;
import com.assainissement.repository.EmployeeRepository;
import com.assainissement.repository.MissionRepository;
import com.assainissement.repository.PointTransactionRepository;
import com.assainissement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PointsService {
    
    private final PointTransactionRepository pointTransactionRepository;
    private final EmployeeRepository employeeRepository;
    private final MissionRepository missionRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public void awardPoints(Long employeeId, Long missionId, PointTransactionType type) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Mission mission = null;
        if (missionId != null) {
            mission = missionRepository.findById(missionId).orElse(null);
        }
        
        int points = type.getDefaultPoints();
        
        PointTransaction transaction = PointTransaction.builder()
                .employee(employee)
                .mission(mission)
                .points(points)
                .type(type)
                .reason(type.getDisplayName())
                .build();
        
        pointTransactionRepository.save(transaction);
        
        // Update employee points
        employee.setTotalPoints(employee.getTotalPoints() + points);
        employee.setMonthlyPoints(employee.getMonthlyPoints() + points);
        employeeRepository.save(employee);
        
        // Update mission points awarded
        if (mission != null) {
            Integer currentPoints = mission.getPointsAwarded() != null ? mission.getPointsAwarded() : 0;
            mission.setPointsAwarded(currentPoints + points);
            missionRepository.save(mission);
        }
    }
    
    @Transactional
    public void deductPoints(Long employeeId, Long missionId, PointTransactionType type) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Mission mission = null;
        if (missionId != null) {
            mission = missionRepository.findById(missionId).orElse(null);
        }
        
        int points = type.getDefaultPoints(); // Already negative
        
        PointTransaction transaction = PointTransaction.builder()
                .employee(employee)
                .mission(mission)
                .points(points)
                .type(type)
                .reason(type.getDisplayName())
                .build();
        
        pointTransactionRepository.save(transaction);
        
        // Update employee points
        employee.setTotalPoints(employee.getTotalPoints() + points);
        employee.setMonthlyPoints(employee.getMonthlyPoints() + points);
        employeeRepository.save(employee);
    }
    
    @Transactional
    public void manualAdjustment(Long employeeId, int points, String reason, Long createdByUserId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PointTransaction transaction = PointTransaction.builder()
                .employee(employee)
                .points(points)
                .type(PointTransactionType.MANUAL_ADJUSTMENT)
                .reason(reason)
                .createdBy(createdBy)
                .build();
        
        pointTransactionRepository.save(transaction);
        
        employee.setTotalPoints(employee.getTotalPoints() + points);
        employee.setMonthlyPoints(employee.getMonthlyPoints() + points);
        employeeRepository.save(employee);
    }
    
    public List<PointTransactionDTO> getEmployeeTransactions(Long employeeId) {
        return pointTransactionRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PointTransactionDTO> getEmployeeTransactionsByDateRange(Long employeeId, LocalDateTime start, LocalDateTime end) {
        return pointTransactionRepository.findByEmployeeIdAndDateRange(employeeId, start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public Integer getTotalPoints(Long employeeId) {
        Integer sum = pointTransactionRepository.sumPointsByEmployee(employeeId);
        return sum != null ? sum : 0;
    }
    
    public Integer getPointsForPeriod(Long employeeId, LocalDateTime start, LocalDateTime end) {
        Integer sum = pointTransactionRepository.sumPointsByEmployeeAndDateRange(employeeId, start, end);
        return sum != null ? sum : 0;
    }
    
    private PointTransactionDTO toDTO(PointTransaction transaction) {
        return PointTransactionDTO.builder()
                .id(transaction.getId())
                .employeeId(transaction.getEmployee().getId())
                .employeeName(transaction.getEmployee().getUser().getFullName())
                .missionId(transaction.getMission() != null ? transaction.getMission().getId() : null)
                .missionTitle(transaction.getMission() != null ? transaction.getMission().getTitle() : null)
                .points(transaction.getPoints())
                .type(transaction.getType())
                .reason(transaction.getReason())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
