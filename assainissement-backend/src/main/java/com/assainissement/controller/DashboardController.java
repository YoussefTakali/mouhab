package com.assainissement.controller;

import com.assainissement.dto.DashboardStatsDTO;
import com.assainissement.entity.User;
import com.assainissement.service.DashboardService;
import com.assainissement.service.EmployeeService;
import com.assainissement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final UserService userService;
    private final EmployeeService employeeService;
    
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
    
    @GetMapping("/stats/employee/{employeeId}")
    public ResponseEntity<DashboardStatsDTO> getEmployeeDashboardStats(@PathVariable Long employeeId) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboardStats(employeeId));
    }
    
    @GetMapping("/my-stats")
    public ResponseEntity<DashboardStatsDTO> getMyDashboardStats(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        var employee = userService.getEmployeeDTO(user);
        if (employee != null) {
            return ResponseEntity.ok(dashboardService.getEmployeeDashboardStats(employee.getId()));
        }
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}
