package com.assainissement.controller;

import com.assainissement.dto.SalaryAdvanceDTO;
import com.assainissement.entity.User;
import com.assainissement.service.SalaryAdvanceService;
import com.assainissement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary-advances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryAdvanceController {
    
    private final SalaryAdvanceService salaryAdvanceService;
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalaryAdvanceDTO>> getAllAdvances() {
        return ResponseEntity.ok(salaryAdvanceService.findAll());
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalaryAdvanceDTO>> getPendingAdvances() {
        return ResponseEntity.ok(salaryAdvanceService.findPendingAdvances());
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<SalaryAdvanceDTO>> getEmployeeAdvances(@PathVariable Long employeeId) {
        return ResponseEntity.ok(salaryAdvanceService.findByEmployee(employeeId));
    }
    
    @GetMapping("/my-advances")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<SalaryAdvanceDTO>> getMyAdvances(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName());
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(salaryAdvanceService.findByEmployee(currentUser.getEmployee().getId()));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createAdvance(
            @Valid @RequestBody SalaryAdvanceDTO dto,
            Authentication authentication) {
        try {
            // If no employeeId specified, use current user's employee
            if (dto.getEmployeeId() == null) {
                User currentUser = userService.findByEmail(authentication.getName());
                if (currentUser.getEmployee() == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "User is not an employee"));
                }
                dto.setEmployeeId(currentUser.getEmployee().getId());
            }
            
            SalaryAdvanceDTO created = salaryAdvanceService.createSalaryAdvance(dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveAdvance(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User currentUser = userService.findByEmail(authentication.getName());
            SalaryAdvanceDTO approved = salaryAdvanceService.approveSalaryAdvance(id, currentUser.getId());
            return ResponseEntity.ok(approved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectAdvance(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            User currentUser = userService.findByEmail(authentication.getName());
            String reason = body.get("reason");
            SalaryAdvanceDTO rejected = salaryAdvanceService.rejectSalaryAdvance(id, currentUser.getId(), reason);
            return ResponseEntity.ok(rejected);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        try {
            SalaryAdvanceDTO paid = salaryAdvanceService.markAsPaid(id);
            return ResponseEntity.ok(paid);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
