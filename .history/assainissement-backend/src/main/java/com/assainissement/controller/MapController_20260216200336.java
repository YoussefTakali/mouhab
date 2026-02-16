package com.assainissement.controller;

import com.assainissement.dto.EmployeeDTO;
import com.assainissement.dto.MapDataDTO;
import com.assainissement.dto.MissionDTO;
import com.assainissement.service.EmployeeService;
import com.assainissement.service.MissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MapController {

    private final MissionService missionService;
    private final EmployeeService employeeService;

    @GetMapping("/data")
    public ResponseEntity<MapDataDTO> getMapData() {
        // Get all missions that have coordinates
        List<MissionDTO> missions = missionService.findAllMissions().stream()
                .filter(m -> m.getLatitude() != null && m.getLongitude() != null)
                .collect(Collectors.toList());

        // Get all employees/workers that have location data
        List<EmployeeDTO> workers = employeeService.findAllEmployees().stream()
                .filter(e -> e.getCurrentLatitude() != null && e.getCurrentLongitude() != null)
                .collect(Collectors.toList());

        MapDataDTO mapData = MapDataDTO.builder()
                .missions(missions)
                .workers(workers)
                .build();

        return ResponseEntity.ok(mapData);
    }

    @GetMapping("/missions")
    public ResponseEntity<List<MissionDTO>> getMissionsWithLocation() {
        List<MissionDTO> missions = missionService.findAllMissions().stream()
                .filter(m -> m.getLatitude() != null && m.getLongitude() != null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(missions);
    }

    @GetMapping("/workers")
    public ResponseEntity<List<EmployeeDTO>> getWorkersWithLocation() {
        List<EmployeeDTO> workers = employeeService.findAllEmployees().stream()
                .filter(e -> e.getCurrentLatitude() != null && e.getCurrentLongitude() != null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(workers);
    }
}
