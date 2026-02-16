package com.assainissement.controller;

import com.assainissement.dto.MissionChecklistDTO;
import com.assainissement.dto.MissionDTO;
import com.assainissement.entity.MissionStatus;
import com.assainissement.entity.User;
import com.assainissement.service.MissionService;
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
@RequestMapping("/api/missions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MissionController {
    
    private final MissionService missionService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<List<MissionDTO>> getAllMissions() {
        return ResponseEntity.ok(missionService.findAllMissions());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MissionDTO> getMission(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.toDTO(missionService.findById(id)));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<MissionDTO>> getMissionsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(missionService.findByEmployee(employeeId));
    }
    
    @GetMapping("/employee/{employeeId}/status/{status}")
    public ResponseEntity<List<MissionDTO>> getMissionsByEmployeeAndStatus(
            @PathVariable Long employeeId,
            @PathVariable MissionStatus status) {
        return ResponseEntity.ok(missionService.findByEmployeeAndStatus(employeeId, status));
    }
    
    @GetMapping("/calendar")
    public ResponseEntity<List<MissionDTO>> getMissionsForCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(missionService.findByDateRange(start, end));
    }
    
    @GetMapping("/employee/{employeeId}/calendar")
    public ResponseEntity<List<MissionDTO>> getEmployeeMissionsForCalendar(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(missionService.findEmployeeMissionsByDateRange(employeeId, start, end));
    }
    
    @GetMapping("/urgent")
    public ResponseEntity<List<MissionDTO>> getUrgentMissions() {
        return ResponseEntity.ok(missionService.findUrgentMissions());
    }
    
    @GetMapping("/awaiting-approval")
    public ResponseEntity<List<MissionDTO>> getMissionsAwaitingApproval() {
        return ResponseEntity.ok(missionService.findMissionsAwaitingApproval());
    }
    
    @GetMapping("/unassigned")
    public ResponseEntity<List<MissionDTO>> getUnassignedMissions() {
        return ResponseEntity.ok(missionService.findUnassignedMissions());
    }
    
    @PostMapping
    public ResponseEntity<MissionDTO> createMission(@RequestBody MissionDTO missionDTO, 
                                                     Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(missionService.createMission(missionDTO, user.getId()));
    }
    
    @PutMapping("/{id}/assign/{employeeId}")
    public ResponseEntity<MissionDTO> assignMission(@PathVariable Long id, 
                                                     @PathVariable Long employeeId) {
        return ResponseEntity.ok(missionService.assignMission(id, employeeId));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<MissionDTO> updateStatus(@PathVariable Long id,
                                                    @RequestBody Map<String, String> request,
                                                    Authentication authentication) {
        MissionStatus status = MissionStatus.valueOf(request.get("status"));
        User user = userService.findByEmail(authentication.getName());
        
        // Get employee ID from user
        Long employeeId = null;
        if (userService.getEmployeeDTO(user) != null) {
            employeeId = userService.getEmployeeDTO(user).getId();
        }
        
        return ResponseEntity.ok(missionService.updateStatus(id, status, employeeId));
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<MissionDTO> approveMission(@PathVariable Long id,
                                                      @RequestBody(required = false) Map<String, String> request,
                                                      Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        String notes = request != null ? request.get("notes") : null;
        return ResponseEntity.ok(missionService.approveMission(id, user.getId(), notes));
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<MissionDTO> rejectMission(@PathVariable Long id,
                                                     @RequestBody Map<String, String> request,
                                                     Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        String reason = request.get("reason");
        return ResponseEntity.ok(missionService.rejectMission(id, user.getId(), reason));
    }
    
    @PutMapping("/{missionId}/checklist/{checklistId}")
    public ResponseEntity<Void> updateChecklist(@PathVariable Long missionId,
                                                 @PathVariable Long checklistId,
                                                 @RequestBody Map<String, Boolean> request) {
        missionService.updateChecklist(missionId, checklistId, request.get("completed"));
        return ResponseEntity.ok().build();
    }
}
