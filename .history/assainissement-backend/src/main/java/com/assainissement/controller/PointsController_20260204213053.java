package com.assainissement.controller;

import com.assainissement.dto.PointTransactionDTO;
import com.assainissement.entity.User;
import com.assainissement.service.PointsService;
import com.assainissement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PointsController {
    
    private final PointsService pointsService;
    private final UserService userService;
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PointTransactionDTO>> getEmployeeTransactions(@PathVariable Long employeeId) {
        return ResponseEntity.ok(pointsService.getEmployeeTransactions(employeeId));
    }
    
    @GetMapping("/employee/{employeeId}/range")
    public ResponseEntity<List<PointTransactionDTO>> getEmployeeTransactionsByRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(pointsService.getEmployeeTransactionsByDateRange(employeeId, start, end));
    }
    
    @GetMapping("/employee/{employeeId}/total")
    public ResponseEntity<Integer> getTotalPoints(@PathVariable Long employeeId) {
        return ResponseEntity.ok(pointsService.getTotalPoints(employeeId));
    }
    
    @GetMapping("/employee/{employeeId}/period")
    public ResponseEntity<Integer> getPointsForPeriod(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(pointsService.getPointsForPeriod(employeeId, start, end));
    }
    
    @PostMapping("/employee/{employeeId}/adjust")
    public ResponseEntity<Void> manualAdjustment(@PathVariable Long employeeId,
                                                  @RequestBody Map<String, Object> request,
                                                  Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        int points = ((Number) request.get("points")).intValue();
        String reason = (String) request.get("reason");
        pointsService.manualAdjustment(employeeId, points, reason, user.getId());
        return ResponseEntity.ok().build();
    }
}
