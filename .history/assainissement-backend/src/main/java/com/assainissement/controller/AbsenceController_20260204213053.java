package com.assainissement.controller;

import com.assainissement.dto.AbsenceDTO;
import com.assainissement.entity.AbsenceStatus;
import com.assainissement.entity.User;
import com.assainissement.service.AbsenceService;
import com.assainissement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AbsenceController {
    
    private final AbsenceService absenceService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<List<AbsenceDTO>> getAllAbsences() {
        return ResponseEntity.ok(absenceService.findAll());
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<AbsenceDTO>> getPendingAbsences() {
        return ResponseEntity.ok(absenceService.findPendingAbsences());
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AbsenceDTO>> getEmployeeAbsences(@PathVariable Long employeeId) {
        return ResponseEntity.ok(absenceService.findByEmployee(employeeId));
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<AbsenceDTO>> getAbsencesOnDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(absenceService.findAbsencesOnDate(date));
    }
    
    @GetMapping("/range")
    public ResponseEntity<List<AbsenceDTO>> getAbsencesBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(absenceService.findAbsencesBetween(start, end));
    }
    
    @GetMapping("/employee/{employeeId}/is-absent")
    public ResponseEntity<Boolean> isEmployeeAbsent(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(absenceService.isEmployeeAbsent(employeeId, date));
    }
    
    @PostMapping
    public ResponseEntity<AbsenceDTO> createAbsence(@RequestBody AbsenceDTO absenceDTO) {
        return ResponseEntity.ok(absenceService.createAbsence(absenceDTO));
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<AbsenceDTO> approveAbsence(@PathVariable Long id,
                                                      Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(absenceService.approveAbsence(id, user.getId()));
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<AbsenceDTO> rejectAbsence(@PathVariable Long id,
                                                     @RequestBody Map<String, String> request,
                                                     Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        String notes = request.get("notes");
        return ResponseEntity.ok(absenceService.rejectAbsence(id, user.getId(), notes));
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<AbsenceDTO> cancelAbsence(@PathVariable Long id) {
        return ResponseEntity.ok(absenceService.cancelAbsence(id));
    }
}
