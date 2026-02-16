package com.assainissement.dto;

import com.assainissement.entity.ContractType;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {
    private Long id;
    private UserDTO user;
    private String employeeCode;
    private LocalDate hireDate;
    private LocalDate contractEndDate;
    private ContractType contractType;
    private List<String> skills;
    private List<String> certifications;
    private boolean safetyTrainingCompleted;
    private LocalDate lastSafetyTrainingDate;
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentAddress;
    private Integer totalPoints;
    private Integer monthlyPoints;
    private Double averageCompletionTime;
    private Double successRate;
    private Integer totalMissionsCompleted;
    private Double totalDistanceTraveled;
    private Long supervisorId;
    private String supervisorName;
}
