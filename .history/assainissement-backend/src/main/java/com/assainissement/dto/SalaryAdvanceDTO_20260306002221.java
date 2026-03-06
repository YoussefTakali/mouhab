package com.assainissement.dto;

import com.assainissement.entity.SalaryAdvanceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryAdvanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private BigDecimal amount;
    private LocalDate requestedDate;
    private String reason;
    private SalaryAdvanceStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private LocalDate paidDate;
    private LocalDateTime createdAt;
}
