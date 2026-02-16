package com.assainissement.repository;

import com.assainissement.entity.PointTransaction;
import com.assainissement.entity.PointTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    
    List<PointTransaction> findByEmployeeId(Long employeeId);
    
    List<PointTransaction> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    
    List<PointTransaction> findByType(PointTransactionType type);
    
    @Query("SELECT pt FROM PointTransaction pt WHERE pt.employee.id = :employeeId " +
           "AND pt.createdAt >= :start AND pt.createdAt <= :end")
    List<PointTransaction> findByEmployeeIdAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
    
    @Query("SELECT SUM(pt.points) FROM PointTransaction pt WHERE pt.employee.id = :employeeId")
    Integer sumPointsByEmployee(@Param("employeeId") Long employeeId);
    
    @Query("SELECT SUM(pt.points) FROM PointTransaction pt WHERE pt.employee.id = :employeeId " +
           "AND pt.createdAt >= :start AND pt.createdAt <= :end")
    Integer sumPointsByEmployeeAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
    
    @Query("SELECT pt FROM PointTransaction pt WHERE pt.mission.id = :missionId")
    List<PointTransaction> findByMissionId(@Param("missionId") Long missionId);
}
