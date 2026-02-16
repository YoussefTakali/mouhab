package com.assainissement.repository;

import com.assainissement.entity.Payment;
import com.assainissement.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByClientId(Long clientId);
    
    List<Payment> findByClientIdAndStatus(Long clientId, PaymentStatus status);
    
    List<Payment> findByMissionId(Long missionId);
    
    List<Payment> findByStatus(PaymentStatus status);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.client.id = :clientId AND p.status = 'PAID'")
    BigDecimal sumPaidByClient(@Param("clientId") Long clientId);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.client.id = :clientId AND p.status IN ('PENDING', 'OVERDUE', 'PARTIAL')")
    BigDecimal sumDueByClient(@Param("clientId") Long clientId);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.client.id = :clientId")
    long countByClientId(@Param("clientId") Long clientId);
}
