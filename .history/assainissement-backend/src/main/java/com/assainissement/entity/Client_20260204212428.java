package com.assainissement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
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
    
    // Contract info
    private boolean hasContract;
    private LocalDateTime contractStartDate;
    private LocalDateTime contractEndDate;
    
    private String notes;
    
    private boolean active;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        active = true;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
