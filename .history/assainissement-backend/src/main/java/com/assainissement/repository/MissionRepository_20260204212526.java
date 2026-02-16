package com.assainissement.repository;

import com.assainissement.entity.Mission;
import com.assainissement.entity.MissionStatus;
import com.assainissement.entity.MissionType;
import com.assainissement.entity.MissionPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {
    
    List<Mission> findByAssignedToId(Long employeeId);
    
    List<Mission> findByStatus(MissionStatus status);
    
    List<Mission> findByType(MissionType type);
    
    List<Mission> findByPriority(MissionPriority priority);
    
    @Query("SELECT m FROM Mission m WHERE m.assignedTo.id = :employeeId AND m.status = :status")
    List<Mission> findByAssignedToIdAndStatus(@Param("employeeId") Long employeeId, 
                                               @Param("status") MissionStatus status);
    
    @Query("SELECT m FROM Mission m WHERE m.assignedTo.id = :employeeId " +
           "AND m.scheduledStartTime >= :start AND m.scheduledStartTime <= :end")
    List<Mission> findByAssignedToIdAndScheduledStartTimeBetween(
            @Param("employeeId") Long employeeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
    
    @Query("SELECT m FROM Mission m WHERE m.scheduledStartTime >= :start AND m.scheduledStartTime <= :end")
    List<Mission> findByScheduledStartTimeBetween(@Param("start") LocalDateTime start, 
                                                   @Param("end") LocalDateTime end);
    
    @Query("SELECT m FROM Mission m WHERE m.deadline < :now AND m.status NOT IN ('APPROVED', 'REJECTED', 'CANCELLED')")
    List<Mission> findOverdueMissions(@Param("now") LocalDateTime now);
    
    @Query("SELECT m FROM Mission m WHERE m.priority IN ('URGENT', 'EMERGENCY') " +
           "AND m.status NOT IN ('APPROVED', 'REJECTED', 'CANCELLED')")
    List<Mission> findUrgentMissions();
    
    @Query("SELECT m FROM Mission m WHERE m.status = 'COMPLETED' OR m.status = 'PENDING_REVIEW'")
    List<Mission> findMissionsAwaitingApproval();
    
    @Query("SELECT m FROM Mission m WHERE m.aiConfidenceScore >= :minScore AND m.status = 'COMPLETED'")
    List<Mission> findMissionsWithHighAiScore(@Param("minScore") Double minScore);
    
    @Query("SELECT m FROM Mission m WHERE m.aiConfidenceScore < :maxScore AND m.status = 'COMPLETED'")
    List<Mission> findMissionsWithLowAiScore(@Param("maxScore") Double maxScore);
    
    @Query("SELECT m FROM Mission m WHERE m.zone = :zone AND m.status NOT IN ('APPROVED', 'REJECTED', 'CANCELLED')")
    List<Mission> findByZone(@Param("zone") String zone);
    
    @Query("SELECT COUNT(m) FROM Mission m WHERE m.assignedTo.id = :employeeId AND m.status = 'APPROVED'")
    Long countCompletedMissionsByEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT COUNT(m) FROM Mission m WHERE m.status = 'APPROVED' " +
           "AND m.actualEndTime >= :start AND m.actualEndTime <= :end")
    Long countCompletedMissionsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT m FROM Mission m WHERE m.assignedTo IS NULL AND m.status = 'CREATED'")
    List<Mission> findUnassignedMissions();
}
