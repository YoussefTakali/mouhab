package com.assainissement.service;

import com.assainissement.dto.DashboardStatsDTO;
import com.assainissement.entity.Employee;
import com.assainissement.entity.Mission;
import com.assainissement.entity.MissionStatus;
import com.assainissement.repository.EmployeeRepository;
import com.assainissement.repository.MissionRepository;
import com.assainissement.repository.PointTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final MissionRepository missionRepository;
    private final EmployeeRepository employeeRepository;
    private final PointTransactionRepository pointTransactionRepository;
    
    public DashboardStatsDTO getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDateTime startOfWeek = now.minusDays(7);
        
        List<Mission> allMissions = missionRepository.findAll();
        List<Employee> allEmployees = employeeRepository.findAll();
        
        // Mission stats
        long totalMissions = allMissions.size();
        long completedMissions = allMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.APPROVED)
                .count();
        long pendingMissions = allMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.COMPLETED || 
                            m.getStatus() == MissionStatus.PENDING_REVIEW)
                .count();
        long urgentMissions = missionRepository.findUrgentMissions().size();
        long overdueMissions = missionRepository.findOverdueMissions(now).size();
        
        double completionRate = totalMissions > 0 ? 
                (double) completedMissions / totalMissions * 100 : 0;
        
        // Employee stats
        long totalEmployees = allEmployees.size();
        long activeEmployees = allEmployees.stream()
                .filter(e -> e.getUser().isActive())
                .count();
        long employeesOnMission = allMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.ON_SITE || 
                            m.getStatus() == MissionStatus.IN_PROGRESS ||
                            m.getStatus() == MissionStatus.ON_THE_WAY)
                .map(Mission::getAssignedTo)
                .distinct()
                .count();
        
        // Today's stats
        List<Mission> todayMissions = missionRepository.findByScheduledStartTimeBetween(startOfDay, endOfDay);
        long todayTotal = todayMissions.size();
        long todayCompleted = todayMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.APPROVED)
                .count();
        long todayPending = todayMissions.stream()
                .filter(m -> m.getStatus() != MissionStatus.APPROVED && 
                            m.getStatus() != MissionStatus.REJECTED &&
                            m.getStatus() != MissionStatus.CANCELLED)
                .count();
        
        // Weekly stats
        List<Mission> weeklyMissions = missionRepository.findByScheduledStartTimeBetween(startOfWeek, now);
        long weeklyTotal = weeklyMissions.size();
        long weeklyCompleted = weeklyMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.APPROVED)
                .count();
        
        // AI stats
        long aiApproved = allMissions.stream()
                .filter(m -> m.isAiApproved() && m.getStatus() == MissionStatus.APPROVED)
                .count();
        long aiPendingReview = allMissions.stream()
                .filter(m -> m.getAiConfidenceScore() != null && 
                            m.getAiConfidenceScore() < 90 &&
                            (m.getStatus() == MissionStatus.COMPLETED || 
                             m.getStatus() == MissionStatus.PENDING_REVIEW))
                .count();
        double avgAiScore = allMissions.stream()
                .filter(m -> m.getAiConfidenceScore() != null)
                .mapToDouble(Mission::getAiConfidenceScore)
                .average()
                .orElse(0);
        
        // Points stats
        int totalPointsAwarded = allEmployees.stream()
                .mapToInt(e -> e.getTotalPoints() > 0 ? e.getTotalPoints() : 0)
                .sum();
        int totalPointsDeducted = allEmployees.stream()
                .mapToInt(e -> e.getTotalPoints() < 0 ? Math.abs(e.getTotalPoints()) : 0)
                .sum();
        
        return DashboardStatsDTO.builder()
                .totalMissions(totalMissions)
                .completedMissions(completedMissions)
                .pendingMissions(pendingMissions)
                .urgentMissions(urgentMissions)
                .overdueMissions(overdueMissions)
                .completionRate(completionRate)
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .employeesOnMission(employeesOnMission)
                .todayMissions(todayTotal)
                .todayCompleted(todayCompleted)
                .todayPending(todayPending)
                .weeklyMissions(weeklyTotal)
                .weeklyCompleted(weeklyCompleted)
                .aiApprovedMissions(aiApproved)
                .aiPendingReview(aiPendingReview)
                .averageAiScore(avgAiScore)
                .totalPointsAwarded(totalPointsAwarded)
                .totalPointsDeducted(totalPointsDeducted)
                .build();
    }
    
    public DashboardStatsDTO getEmployeeDashboardStats(Long employeeId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDateTime startOfWeek = now.minusDays(7);
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        List<Mission> employeeMissions = missionRepository.findByAssignedToId(employeeId);
        
        // Mission stats
        long totalMissions = employeeMissions.size();
        long completedMissions = employeeMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.APPROVED)
                .count();
        long pendingMissions = employeeMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.ASSIGNED ||
                            m.getStatus() == MissionStatus.ACCEPTED)
                .count();
        
        double completionRate = totalMissions > 0 ? 
                (double) completedMissions / totalMissions * 100 : 0;
        
        // Today's stats
        List<Mission> todayMissions = missionRepository
                .findByAssignedToIdAndScheduledStartTimeBetween(employeeId, startOfDay, endOfDay);
        long todayTotal = todayMissions.size();
        long todayCompleted = todayMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.APPROVED)
                .count();
        long todayPending = todayMissions.stream()
                .filter(m -> m.getStatus() != MissionStatus.APPROVED && 
                            m.getStatus() != MissionStatus.REJECTED)
                .count();
        
        // Weekly stats
        List<Mission> weeklyMissions = missionRepository
                .findByAssignedToIdAndScheduledStartTimeBetween(employeeId, startOfWeek, now);
        long weeklyTotal = weeklyMissions.size();
        long weeklyCompleted = weeklyMissions.stream()
                .filter(m -> m.getStatus() == MissionStatus.APPROVED)
                .count();
        
        return DashboardStatsDTO.builder()
                .totalMissions(totalMissions)
                .completedMissions(completedMissions)
                .pendingMissions(pendingMissions)
                .completionRate(completionRate)
                .todayMissions(todayTotal)
                .todayCompleted(todayCompleted)
                .todayPending(todayPending)
                .weeklyMissions(weeklyTotal)
                .weeklyCompleted(weeklyCompleted)
                .totalPointsAwarded(employee.getTotalPoints())
                .build();
    }
}
