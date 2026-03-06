package com.assainissement.controller;

import com.assainissement.dto.CreateEmployeeRequest;
import com.assainissement.dto.EmployeeDTO;
import com.assainissement.dto.LeaderboardDTO;
import com.assainissement.entity.User;
import com.assainissement.service.EmployeeService;
import com.assainissement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    private final EmployeeService employeeService;
    
    @GetMapping
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.findAllEmployees());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.findAllEmployees().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Employee not found")));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<EmployeeDTO> getEmployeeByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(employeeService.findAllEmployees().stream()
                .filter(e -> e.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Employee not found")));
    }
    
    @GetMapping("/supervisor/{supervisorId}/team")
    public ResponseEntity<List<EmployeeDTO>> getTeamMembers(@PathVariable Long supervisorId) {
        return ResponseEntity.ok(employeeService.findTeamMembers(supervisorId));
    }
    
    @GetMapping("/skill/{skill}")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesBySkill(@PathVariable String skill) {
        return ResponseEntity.ok(employeeService.findBySkill(skill));
    }
    
    @GetMapping("/nearby")
    public ResponseEntity<List<EmployeeDTO>> getNearbyEmployees(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10") Double distanceKm) {
        return ResponseEntity.ok(employeeService.findNearbyEmployees(latitude, longitude, distanceKm));
    }
    
    @GetMapping("/top-performers")
    public ResponseEntity<List<EmployeeDTO>> getTopPerformers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(employeeService.getTopPerformers(limit));
    }
    
    @GetMapping("/leaderboard")
    public ResponseEntity<LeaderboardDTO> getLeaderboard(
            @RequestParam(defaultValue = "monthly") String period) {
        return ResponseEntity.ok(employeeService.getLeaderboard(period));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable Long id,
                                                       @RequestBody EmployeeDTO employeeDTO) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeDTO));
    }
    
    @PutMapping("/{id}/location")
    public ResponseEntity<Void> updateLocation(@PathVariable Long id,
                                                @RequestBody Map<String, Object> request) {
        Double latitude = ((Number) request.get("latitude")).doubleValue();
        Double longitude = ((Number) request.get("longitude")).doubleValue();
        String address = (String) request.get("address");
        employeeService.updateLocation(id, latitude, longitude, address);
        return ResponseEntity.ok().build();
    }
}
