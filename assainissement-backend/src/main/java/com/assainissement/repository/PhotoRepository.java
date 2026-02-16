package com.assainissement.repository;

import com.assainissement.entity.Photo;
import com.assainissement.entity.PhotoType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    
    List<Photo> findByMissionId(Long missionId);
    
    List<Photo> findByMissionIdAndType(Long missionId, PhotoType type);
    
    @Query("SELECT p FROM Photo p WHERE p.mission.id = :missionId AND p.type = 'BEFORE'")
    List<Photo> findBeforePhotosByMission(@Param("missionId") Long missionId);
    
    @Query("SELECT p FROM Photo p WHERE p.mission.id = :missionId AND p.type = 'AFTER'")
    List<Photo> findAfterPhotosByMission(@Param("missionId") Long missionId);
    
    @Query("SELECT p FROM Photo p WHERE p.aiDetectedFraud = true")
    List<Photo> findFraudulentPhotos();
    
    @Query("SELECT p FROM Photo p WHERE p.validated = false AND p.mission.id = :missionId")
    List<Photo> findUnvalidatedPhotosByMission(@Param("missionId") Long missionId);
    
    @Query("SELECT COUNT(p) FROM Photo p WHERE p.mission.id = :missionId AND p.type = :type")
    Long countPhotosByMissionAndType(@Param("missionId") Long missionId, @Param("type") PhotoType type);
}
