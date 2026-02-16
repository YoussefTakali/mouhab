package com.assainissement.repository;

import com.assainissement.entity.MissionChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionChecklistRepository extends JpaRepository<MissionChecklist, Long> {
    
    List<MissionChecklist> findByMissionIdOrderByOrderIndexAsc(Long missionId);
    
    @Query("SELECT mc FROM MissionChecklist mc WHERE mc.mission.id = :missionId AND mc.completed = false")
    List<MissionChecklist> findIncompleteItemsByMission(@Param("missionId") Long missionId);
    
    @Query("SELECT mc FROM MissionChecklist mc WHERE mc.mission.id = :missionId AND mc.mandatory = true AND mc.completed = false")
    List<MissionChecklist> findIncompleteMandatoryItemsByMission(@Param("missionId") Long missionId);
    
    @Query("SELECT COUNT(mc) FROM MissionChecklist mc WHERE mc.mission.id = :missionId AND mc.completed = true")
    Long countCompletedItems(@Param("missionId") Long missionId);
    
    @Query("SELECT COUNT(mc) FROM MissionChecklist mc WHERE mc.mission.id = :missionId")
    Long countTotalItems(@Param("missionId") Long missionId);
}
