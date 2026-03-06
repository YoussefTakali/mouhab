package com.assainissement.service;

import com.assainissement.dto.CreateEmployeeRequest;
import com.assainissement.dto.EmployeeDTO;
import com.assainissement.dto.LeaderboardDTO;
import com.assainissement.dto.LeaderboardEntryDTO;
import com.assainissement.entity.Employee;
import com.assainissement.entity.Mission;
import com.assainissement.entity.MissionStatus;
import com.assainissement.entity.User;
import com.assainissement.entity.UserRole;
import com.assainissement.repository.EmployeeRepository;
import com.assainissement.repository.MissionRepository;
import com.assainissement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final MissionRepository missionRepository;
    private final UserService userService;
    
    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }
    
    public Employee findByUserId(Long userId) {
        return employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found for user id: " + userId));
    }
    
    public List<EmployeeDTO> findAllEmployees() {
        return employeeRepository.findAllActive().stream()
                .map(userService::toEmployeeDTO)
                .collect(Collectors.toList());
    }
    
    public List<EmployeeDTO> findTeamMembers(Long supervisorId) {
        return employeeRepository.findBySuperviorId(supervisorId).stream()
                .map(userService::toEmployeeDTO)
                .collect(Collectors.toList());
    }
    
    public List<EmployeeDTO> findBySkill(String skill) {
        return employeeRepository.findBySkill(skill).stream()
                .map(userService::toEmployeeDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        Employee employee = findById(id);
        employee.setSkills(employeeDTO.getSkills());
        employee.setCertifications(employeeDTO.getCertifications());
        employee.setSafetyTrainingCompleted(employeeDTO.isSafetyTrainingCompleted());
        employee.setLastSafetyTrainingDate(employeeDTO.getLastSafetyTrainingDate());
        employee.setContractType(employeeDTO.getContractType());
        employee.setHireDate(employeeDTO.getHireDate());
        employee.setContractEndDate(employeeDTO.getContractEndDate());
        
        if (employeeDTO.getSupervisorId() != null) {
            Employee supervisor = findById(employeeDTO.getSupervisorId());
            employee.setSupervisor(supervisor);
        }
        
        return userService.toEmployeeDTO(employeeRepository.save(employee));
    }
    
    @Transactional
    public void updateLocation(Long employeeId, Double latitude, Double longitude, String address) {
        Employee employee = findById(employeeId);
        employee.setCurrentLatitude(latitude);
        employee.setCurrentLongitude(longitude);
        employee.setCurrentAddress(address);
        employeeRepository.save(employee);
    }
    
    @Transactional
    public void addPoints(Long employeeId, int points) {
        Employee employee = findById(employeeId);
        employee.setTotalPoints(employee.getTotalPoints() + points);
        employee.setMonthlyPoints(employee.getMonthlyPoints() + points);
        employeeRepository.save(employee);
    }
    
    @Transactional
    public void resetMonthlyPoints() {
        List<Employee> employees = employeeRepository.findAll();
        employees.forEach(e -> e.setMonthlyPoints(0));
        employeeRepository.saveAll(employees);
    }
    
    public List<EmployeeDTO> findNearbyEmployees(Double latitude, Double longitude, Double distanceKm) {
        return employeeRepository.findNearbyEmployees(latitude, longitude, distanceKm).stream()
                .map(userService::toEmployeeDTO)
                .collect(Collectors.toList());
    }
    
    public LeaderboardDTO getLeaderboard(String period) {
        List<Employee> employees;
        if ("monthly".equals(period)) {
            employees = employeeRepository.findAllOrderByMonthlyPointsDesc();
        } else {
            employees = employeeRepository.findAllOrderByTotalPointsDesc();
        }
        
        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        int rank = 1;
        
        for (Employee employee : employees) {
            if (!employee.getUser().isActive()) continue;
            
            Long completedMissions = missionRepository.countCompletedMissionsByEmployee(employee.getId());
            
            String badge = "none";
            if (rank == 1) badge = "gold";
            else if (rank == 2) badge = "silver";
            else if (rank == 3) badge = "bronze";
            
            entries.add(LeaderboardEntryDTO.builder()
                    .rank(rank)
                    .employeeId(employee.getId())
                    .employeeName(employee.getUser().getFullName())
                    .profilePhoto(employee.getUser().getProfilePhoto())
                    .points("monthly".equals(period) ? employee.getMonthlyPoints() : employee.getTotalPoints())
                    .missionsCompleted(completedMissions.intValue())
                    .successRate(employee.getSuccessRate() != null ? employee.getSuccessRate() : 0.0)
                    .badge(badge)
                    .build());
            
            rank++;
        }
        
        return LeaderboardDTO.builder()
                .entries(entries)
                .totalEmployees(entries.size())
                .period(period)
                .build();
    }
    
    public List<EmployeeDTO> getTopPerformers(int limit) {
        return employeeRepository.findTopPerformers(limit).stream()
                .map(userService::toEmployeeDTO)
                .collect(Collectors.toList());
    }
}
