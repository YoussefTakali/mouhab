package com.assainissement.dto;

import com.assainissement.entity.ContractType;
import com.assainissement.entity.UserRole;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEmployeeRequest {
    // User info
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private UserRole role; // WORKER or SUPERVISOR
    
    // Employee info
    private LocalDate hireDate;
    private LocalDate contractEndDate;
    private ContractType contractType;
    private List<String> skills;
    private List<String> certifications;
    private Long supervisorId;
}
