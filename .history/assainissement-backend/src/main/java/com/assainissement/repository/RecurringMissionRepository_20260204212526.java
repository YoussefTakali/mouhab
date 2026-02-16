package com.assainissement.repository;

import com.assainissement.entity.RecurringMission;
import com.assainissement.entity.RecurrenceFrequency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringMissionRepository extends JpaRepository<RecurringMission, Long> {
    
    List<RecurringMission> findByActiveTrue();
    
    List<RecurringMission> findByFrequency(RecurrenceFrequency frequency);
    
    List<RecurringMission> findByAssignedToId(Long employeeId);
    
    @Query("SELECT rm FROM RecurringMission rm WHERE rm.active = true " +
           "AND (rm.endDate IS NULL OR rm.endDate >= :today)")
    List<RecurringMission> findActiveRecurringMissions(@Param("today") LocalDate today);
    
    @Query("SELECT rm FROM RecurringMission rm WHERE rm.active = true " +
           "AND rm.frequency = :frequency " +
           "AND (rm.lastGeneratedAt IS NULL OR rm.lastGeneratedAt < :before)")
    List<RecurringMission> findMissionsNeedingGeneration(
            @Param("frequency") RecurrenceFrequency frequency,
            @Param("before") LocalDate before);
}
