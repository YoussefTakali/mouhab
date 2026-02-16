package com.assainissement.repository;

import com.assainissement.entity.Absence;
import com.assainissement.entity.AbsenceStatus;
import com.assainissement.entity.AbsenceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    
    List<Absence> findByEmployeeId(Long employeeId);
    
    List<Absence> findByStatus(AbsenceStatus status);
    
    List<Absence> findByType(AbsenceType type);
    
    @Query("SELECT a FROM Absence a WHERE a.employee.id = :employeeId AND a.status = :status")
    List<Absence> findByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, 
                                             @Param("status") AbsenceStatus status);
    
    @Query("SELECT a FROM Absence a WHERE a.startDate <= :date AND a.endDate >= :date")
    List<Absence> findAbsencesOnDate(@Param("date") LocalDate date);
    
    @Query("SELECT a FROM Absence a WHERE a.employee.id = :employeeId " +
           "AND a.startDate <= :date AND a.endDate >= :date AND a.status = 'APPROVED'")
    List<Absence> findApprovedAbsenceForEmployeeOnDate(
            @Param("employeeId") Long employeeId,
            @Param("date") LocalDate date);
    
    @Query("SELECT a FROM Absence a WHERE a.startDate >= :start AND a.endDate <= :end")
    List<Absence> findAbsencesBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
    
    @Query("SELECT COUNT(a) FROM Absence a WHERE a.employee.id = :employeeId " +
           "AND a.type = 'ABSENCE_INJUSTIFIEE' AND a.status = 'APPROVED'")
    Long countUnjustifiedAbsences(@Param("employeeId") Long employeeId);
}
