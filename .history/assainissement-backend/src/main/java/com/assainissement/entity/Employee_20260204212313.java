package com.assainissement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String employeeCode;
    
    private LocalDate hireDate;
    
    private LocalDate contractEndDate;
    
    @Enumerated(EnumType.STRING)
    private ContractType contractType;
    
    @ElementCollection
    @CollectionTable(name = "employee_skills", joinColumns = @JoinColumn(name = "employee_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "employee_certifications", joinColumns = @JoinColumn(name = "employee_id"))
    @Column(name = "certification")
    private List<String> certifications = new ArrayList<>();
    
    private boolean safetyTrainingCompleted;
    
    private LocalDate lastSafetyTrainingDate;
    
    // Current location for GPS tracking
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentAddress;
    
    // Points system
    @Column(nullable = false)
    private Integer totalPoints = 0;
    
    @Column(nullable = false)
    private Integer monthlyPoints = 0;
    
    // Performance metrics
    private Double averageCompletionTime;
    private Double successRate;
    private Integer totalMissionsCompleted;
    private Double totalDistanceTraveled;
    
    // Device info for fraud prevention
    private String deviceId;
    private String deviceModel;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Employee supervisor;
    
    @OneToMany(mappedBy = "supervisor")
    private List<Employee> teamMembers = new ArrayList<>();
    
    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL)
    private List<Mission> missions = new ArrayList<>();
    
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
    private List<PointTransaction> pointTransactions = new ArrayList<>();
    
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
    private List<Absence> absences = new ArrayList<>();
}
