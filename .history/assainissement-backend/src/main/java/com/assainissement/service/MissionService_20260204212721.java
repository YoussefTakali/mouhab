package com.assainissement.service;

import com.assainissement.dto.MissionChecklistDTO;
import com.assainissement.dto.MissionDTO;
import com.assainissement.dto.PhotoDTO;
import com.assainissement.entity.*;
import com.assainissement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MissionService {
    
    private final MissionRepository missionRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final MissionChecklistRepository checklistRepository;
    private final PointsService pointsService;
    private final AIValidationService aiValidationService;
    
    public Mission findById(Long id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mission not found with id: " + id));
    }
    
    public List<MissionDTO> findAllMissions() {
        return missionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MissionDTO> findByEmployee(Long employeeId) {
        return missionRepository.findByAssignedToId(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MissionDTO> findByEmployeeAndStatus(Long employeeId, MissionStatus status) {
        return missionRepository.findByAssignedToIdAndStatus(employeeId, status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MissionDTO> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return missionRepository.findByScheduledStartTimeBetween(start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MissionDTO> findEmployeeMissionsByDateRange(Long employeeId, LocalDateTime start, LocalDateTime end) {
        return missionRepository.findByAssignedToIdAndScheduledStartTimeBetween(employeeId, start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MissionDTO> findUrgentMissions() {
        return missionRepository.findUrgentMissions().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MissionDTO> findMissionsAwaitingApproval() {
        return missionRepository.findMissionsAwaitingApproval().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MissionDTO> findUnassignedMissions() {
        return missionRepository.findUnassignedMissions().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public MissionDTO createMission(MissionDTO missionDTO, Long createdByUserId) {
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Mission mission = Mission.builder()
                .title(missionDTO.getTitle())
                .description(missionDTO.getDescription())
                .type(missionDTO.getType())
                .status(MissionStatus.CREATED)
                .priority(missionDTO.getPriority() != null ? missionDTO.getPriority() : MissionPriority.NORMAL)
                .clientName(missionDTO.getClientName())
                .clientPhone(missionDTO.getClientPhone())
                .clientEmail(missionDTO.getClientEmail())
                .address(missionDTO.getAddress())
                .city(missionDTO.getCity())
                .postalCode(missionDTO.getPostalCode())
                .latitude(missionDTO.getLatitude())
                .longitude(missionDTO.getLongitude())
                .zone(missionDTO.getZone())
                .scheduledStartTime(missionDTO.getScheduledStartTime())
                .scheduledEndTime(missionDTO.getScheduledEndTime())
                .estimatedDurationMinutes(missionDTO.getEstimatedDurationMinutes())
                .deadline(missionDTO.getDeadline())
                .safetyInstructions(missionDTO.getSafetyInstructions())
                .requiredEquipment(missionDTO.getRequiredEquipment())
                .createdBy(createdBy)
                .build();
        
        Mission savedMission = missionRepository.save(mission);
        
        // Add checklist items
        if (missionDTO.getChecklist() != null) {
            for (MissionChecklistDTO item : missionDTO.getChecklist()) {
                MissionChecklist checklist = MissionChecklist.builder()
                        .mission(savedMission)
                        .item(item.getItem())
                        .description(item.getDescription())
                        .mandatory(item.isMandatory())
                        .orderIndex(item.getOrderIndex())
                        .completed(false)
                        .build();
                checklistRepository.save(checklist);
            }
        }
        
        return toDTO(savedMission);
    }
    
    @Transactional
    public MissionDTO assignMission(Long missionId, Long employeeId) {
        Mission mission = findById(missionId);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        mission.setAssignedTo(employee);
        mission.setStatus(MissionStatus.ASSIGNED);
        
        return toDTO(missionRepository.save(mission));
    }
    
    @Transactional
    public MissionDTO updateStatus(Long missionId, MissionStatus newStatus, Long employeeId) {
        Mission mission = findById(missionId);
        MissionStatus oldStatus = mission.getStatus();
        mission.setStatus(newStatus);
        
        // Handle status-specific logic
        switch (newStatus) {
            case ACCEPTED:
                // Nothing special
                break;
            case ON_THE_WAY:
                // Track when worker starts traveling
                break;
            case ON_SITE:
                mission.setActualStartTime(LocalDateTime.now());
                // Award points for on-time arrival
                if (mission.getScheduledStartTime() != null && 
                    !LocalDateTime.now().isAfter(mission.getScheduledStartTime().plusMinutes(15))) {
                    pointsService.awardPoints(employeeId, missionId, PointTransactionType.ON_TIME_ARRIVAL);
                } else {
                    pointsService.deductPoints(employeeId, missionId, PointTransactionType.LATE_ARRIVAL);
                }
                break;
            case COMPLETED:
                mission.setActualEndTime(LocalDateTime.now());
                if (mission.getActualStartTime() != null) {
                    long minutes = ChronoUnit.MINUTES.between(mission.getActualStartTime(), mission.getActualEndTime());
                    mission.setActualDurationMinutes((int) minutes);
                }
                // Check SLA
                if (mission.getDeadline() != null && LocalDateTime.now().isAfter(mission.getDeadline())) {
                    mission.setSlaBreached(true);
                    pointsService.deductPoints(employeeId, missionId, PointTransactionType.SLA_BREACH);
                }
                // Trigger AI validation
                aiValidationService.validateMission(mission);
                break;
            case APPROVED:
                // Award completion points
                pointsService.awardPoints(employeeId, missionId, PointTransactionType.TASK_COMPLETED);
                // Check AI score for bonus
                if (mission.getAiConfidenceScore() != null && mission.getAiConfidenceScore() >= 90) {
                    pointsService.awardPoints(employeeId, missionId, PointTransactionType.HIGH_AI_QUALITY_SCORE);
                }
                // Zero rework bonus
                if (mission.getRejectionCount() == null || mission.getRejectionCount() == 0) {
                    pointsService.awardPoints(employeeId, missionId, PointTransactionType.ZERO_REWORK);
                }
                // Update employee stats
                updateEmployeeStats(mission.getAssignedTo());
                break;
            case REJECTED:
                pointsService.deductPoints(employeeId, missionId, PointTransactionType.TASK_REJECTED);
                mission.setRejectionCount((mission.getRejectionCount() != null ? mission.getRejectionCount() : 0) + 1);
                break;
            default:
                break;
        }
        
        return toDTO(missionRepository.save(mission));
    }
    
    @Transactional
    public MissionDTO approveMission(Long missionId, Long approvedByUserId, String notes) {
        Mission mission = findById(missionId);
        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        mission.setApprovedBy(approvedBy);
        mission.setSupervisorNotes(notes);
        mission.setSupervisorReviewedAt(LocalDateTime.now());
        
        return updateStatus(missionId, MissionStatus.APPROVED, mission.getAssignedTo().getId());
    }
    
    @Transactional
    public MissionDTO rejectMission(Long missionId, Long rejectedByUserId, String reason) {
        Mission mission = findById(missionId);
        mission.setRejectionReason(reason);
        mission.setSupervisorReviewedAt(LocalDateTime.now());
        
        return updateStatus(missionId, MissionStatus.REJECTED, mission.getAssignedTo().getId());
    }
    
    @Transactional
    public void updateChecklist(Long missionId, Long checklistItemId, boolean completed) {
        MissionChecklist item = checklistRepository.findById(checklistItemId)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));
        item.setCompleted(completed);
        checklistRepository.save(item);
    }
    
    private void updateEmployeeStats(Employee employee) {
        Long completedMissions = missionRepository.countCompletedMissionsByEmployee(employee.getId());
        employee.setTotalMissionsCompleted(completedMissions.intValue());
        
        // Calculate success rate
        List<Mission> allMissions = missionRepository.findByAssignedToId(employee.getId());
        long approved = allMissions.stream().filter(m -> m.getStatus() == MissionStatus.APPROVED).count();
        long total = allMissions.stream().filter(m -> 
            m.getStatus() == MissionStatus.APPROVED || m.getStatus() == MissionStatus.REJECTED
        ).count();
        
        if (total > 0) {
            employee.setSuccessRate((double) approved / total * 100);
        }
        
        // Calculate average completion time
        double avgTime = allMissions.stream()
                .filter(m -> m.getActualDurationMinutes() != null)
                .mapToInt(Mission::getActualDurationMinutes)
                .average()
                .orElse(0);
        employee.setAverageCompletionTime(avgTime);
        
        employeeRepository.save(employee);
    }
    
    public MissionDTO toDTO(Mission mission) {
        List<Photo> photos = photoRepository.findByMissionId(mission.getId());
        List<MissionChecklist> checklists = checklistRepository.findByMissionIdOrderByOrderIndexAsc(mission.getId());
        
        return MissionDTO.builder()
                .id(mission.getId())
                .title(mission.getTitle())
                .description(mission.getDescription())
                .type(mission.getType())
                .status(mission.getStatus())
                .priority(mission.getPriority())
                .clientName(mission.getClientName())
                .clientPhone(mission.getClientPhone())
                .clientEmail(mission.getClientEmail())
                .address(mission.getAddress())
                .city(mission.getCity())
                .postalCode(mission.getPostalCode())
                .latitude(mission.getLatitude())
                .longitude(mission.getLongitude())
                .zone(mission.getZone())
                .scheduledStartTime(mission.getScheduledStartTime())
                .scheduledEndTime(mission.getScheduledEndTime())
                .estimatedDurationMinutes(mission.getEstimatedDurationMinutes())
                .actualStartTime(mission.getActualStartTime())
                .actualEndTime(mission.getActualEndTime())
                .actualDurationMinutes(mission.getActualDurationMinutes())
                .deadline(mission.getDeadline())
                .slaBreached(mission.isSlaBreached())
                .assignedToId(mission.getAssignedTo() != null ? mission.getAssignedTo().getId() : null)
                .assignedToName(mission.getAssignedTo() != null ? mission.getAssignedTo().getUser().getFullName() : null)
                .createdById(mission.getCreatedBy() != null ? mission.getCreatedBy().getId() : null)
                .createdByName(mission.getCreatedBy() != null ? mission.getCreatedBy().getFullName() : null)
                .checklist(checklists.stream().map(this::toChecklistDTO).collect(Collectors.toList()))
                .photos(photos.stream().map(this::toPhotoDTO).collect(Collectors.toList()))
                .beforePhotosCount((int) photos.stream().filter(p -> p.getType() == PhotoType.BEFORE).count())
                .afterPhotosCount((int) photos.stream().filter(p -> p.getType() == PhotoType.AFTER).count())
                .safetyInstructions(mission.getSafetyInstructions())
                .requiredEquipment(mission.getRequiredEquipment())
                .aiConfidenceScore(mission.getAiConfidenceScore())
                .aiValidationNotes(mission.getAiValidationNotes())
                .aiApproved(mission.isAiApproved())
                .supervisorNotes(mission.getSupervisorNotes())
                .pointsAwarded(mission.getPointsAwarded())
                .rejectionReason(mission.getRejectionReason())
                .rejectionCount(mission.getRejectionCount())
                .createdAt(mission.getCreatedAt())
                .build();
    }
    
    private MissionChecklistDTO toChecklistDTO(MissionChecklist checklist) {
        return MissionChecklistDTO.builder()
                .id(checklist.getId())
                .item(checklist.getItem())
                .description(checklist.getDescription())
                .completed(checklist.isCompleted())
                .mandatory(checklist.isMandatory())
                .orderIndex(checklist.getOrderIndex())
                .build();
    }
    
    private PhotoDTO toPhotoDTO(Photo photo) {
        return PhotoDTO.builder()
                .id(photo.getId())
                .missionId(photo.getMission().getId())
                .fileName(photo.getFileName())
                .filePath(photo.getFilePath())
                .originalFileName(photo.getOriginalFileName())
                .fileSize(photo.getFileSize())
                .mimeType(photo.getMimeType())
                .type(photo.getType())
                .latitude(photo.getLatitude())
                .longitude(photo.getLongitude())
                .capturedAddress(photo.getCapturedAddress())
                .capturedAt(photo.getCapturedAt())
                .deviceId(photo.getDeviceId())
                .fromGallery(photo.isFromGallery())
                .aiQualityScore(photo.getAiQualityScore())
                .aiAnalysisNotes(photo.getAiAnalysisNotes())
                .aiDetectedFraud(photo.isAiDetectedFraud())
                .validated(photo.isValidated())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}
