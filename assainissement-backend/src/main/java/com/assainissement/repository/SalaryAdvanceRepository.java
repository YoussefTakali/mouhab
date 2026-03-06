package com.assainissement.repository;

import com.assainissement.entity.SalaryAdvance;
import com.assainissement.entity.SalaryAdvanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalaryAdvanceRepository extends JpaRepository<SalaryAdvance, Long> {
    
    List<SalaryAdvance> findByEmployeeId(Long employeeId);
    
    List<SalaryAdvance> findByStatus(SalaryAdvanceStatus status);
    
    @Query("SELECT sa FROM SalaryAdvance sa WHERE sa.employee.id = :employeeId ORDER BY sa.createdAt DESC")
    List<SalaryAdvance> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") Long employeeId);
    
    @Query("SELECT sa FROM SalaryAdvance sa ORDER BY sa.createdAt DESC")
    List<SalaryAdvance> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT sa FROM SalaryAdvance sa WHERE sa.status = 'PENDING' ORDER BY sa.createdAt ASC")
    List<SalaryAdvance> findPendingAdvances();
    
    @Query("SELECT sa FROM SalaryAdvance sa WHERE sa.requestedDate BETWEEN :start AND :end")
    List<SalaryAdvance> findByRequestedDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
