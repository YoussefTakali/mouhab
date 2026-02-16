package com.assainissement.dto;

import com.assainissement.entity.ClientType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientDTO {
    private Long id;
    private String name;
    private ClientType type;
    private String contactPerson;
    private String email;
    private String phone;
    
    // Address
    private String address;
    private String city;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    
    // Billing
    private String siret;
    private String vatNumber;
    private String billingAddress;
    
    // Contract
    private boolean hasContract;
    private LocalDateTime contractStartDate;
    private LocalDateTime contractEndDate;
    
    private String notes;
    private boolean active;
    
    // Stats (computed)
    private int totalMissions;
    private int completedMissions;
    private int inProgressMissions;
    private BigDecimal totalPaid;
    private BigDecimal totalDue;
    private BigDecimal balance;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
