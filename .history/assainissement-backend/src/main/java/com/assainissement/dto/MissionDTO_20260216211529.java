package com.assainissement.dto;

import com.assainissement.entity.MissionPriority;
import com.assainissement.entity.MissionStatus;
import com.assainissement.entity.MissionType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionDTO {
    private Long id;
    private String title;
    private String description;
    private MissionType type;
    private MissionStatus status;
    private MissionPriority priority;
    
    // Client info
    private Long clientId;
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    
    // Location
    private String address;
    private String city;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private String zone;
    
    // Timing
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private Integer estimatedDurationMinutes;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Integer actualDurationMinutes;
    private LocalDateTime deadline;
    private boolean slaBreached;
    
    // Assignment
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    
    // Checklist
    private List<MissionChecklistDTO> checklist;
    
    // Photos
    private List<PhotoDTO> photos;
    private int beforePhotosCount;
    private int afterPhotosCount;
    
    // Instructions
    private String safetyInstructions;
    private List<String> requiredEquipment;
    
    // AI Validation
    private Double aiConfidenceScore;
    private String aiValidationNotes;
    private boolean aiApproved;
    
    // Supervisor
    private String supervisorNotes;
    
    // Points
    private Integer pointsAwarded;
    
    // Rejection
    private String rejectionReason;
    private Integer rejectionCount;
    
    private LocalDateTime createdAt;
}
