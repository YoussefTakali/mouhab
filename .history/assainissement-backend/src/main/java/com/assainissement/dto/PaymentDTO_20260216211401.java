package com.assainissement.dto;

import com.assainissement.entity.PaymentMethod;
import com.assainissement.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long missionId;
    private String missionTitle;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private String reference;
    private String invoiceNumber;
    private String notes;
    private LocalDateTime paymentDate;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
}
