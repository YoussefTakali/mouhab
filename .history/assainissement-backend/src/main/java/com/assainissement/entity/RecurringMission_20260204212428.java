package com.assainissement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recurring_missions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringMission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionType type;
    
    // Client info
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    
    // Location
    @Column(nullable = false)
    private String address;
    private String city;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    
    private String zone;
    
    // Recurrence settings
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurrenceFrequency frequency;
    
    private Integer dayOfWeek;      // 1-7 for weekly
    private Integer dayOfMonth;     // 1-31 for monthly
    private Integer monthOfYear;    // 1-12 for yearly
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    private Integer estimatedDurationMinutes;
    
    // Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private Employee assignedTo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;
    
    @OneToMany(mappedBy = "recurringMission")
    private List<Mission> generatedMissions = new ArrayList<>();
    
    private boolean active;
    
    private LocalDateTime lastGeneratedAt;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == false) {
            active = true;
        }
    }
}
