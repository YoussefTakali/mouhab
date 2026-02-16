package com.assainissement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "missions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {
    
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
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionStatus status;
    
    @Enumerated(EnumType.STRING)
    private MissionPriority priority;
    
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
    
    // Zone for grouping
    private String zone;
    
    // Timing
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private Integer estimatedDurationMinutes;
    
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Integer actualDurationMinutes;
    
    // SLA
    private LocalDateTime deadline;
    private boolean slaBreached;
    
    // Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private Employee assignedTo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;
    
    // Checklist
    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MissionChecklist> checklist = new ArrayList<>();
    
    // Photos
    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();
    
    // Safety instructions
    @Column(length = 2000)
    private String safetyInstructions;
    
    // Equipment needed
    @ElementCollection
    @CollectionTable(name = "mission_equipment", joinColumns = @JoinColumn(name = "mission_id"))
    @Column(name = "equipment")
    private List<String> requiredEquipment = new ArrayList<>();
    
    // AI Validation
    private Double aiConfidenceScore;
    private String aiValidationNotes;
    private boolean aiApproved;
    
    // Supervisor validation
    private String supervisorNotes;
    private LocalDateTime supervisorReviewedAt;
    
    // Client signature
    private String clientSignature;
    private LocalDateTime signedAt;
    
    // Recurring mission reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recurring_mission_id")
    private RecurringMission recurringMission;
    
    // Points awarded for this mission
    private Integer pointsAwarded;
    
    // Rejection info
    private String rejectionReason;
    private Integer rejectionCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = MissionStatus.CREATED;
        }
        if (priority == null) {
            priority = MissionPriority.NORMAL;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
