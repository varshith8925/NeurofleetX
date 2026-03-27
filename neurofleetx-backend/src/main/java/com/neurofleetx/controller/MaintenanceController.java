// backend/src/main/java/com/neurofleetx/controller/MaintenanceController.java
package com.neurofleetx.controller;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.MaintenanceDTO;
import com.neurofleetx.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {
    
    private final MaintenanceService maintenanceService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getAllMaintenance() {
        return ResponseEntity.ok(maintenanceService.getAllMaintenance());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> getMaintenanceById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceDTO>> createMaintenance(@RequestBody MaintenanceDTO maintenanceDTO) {
        return ResponseEntity.ok(maintenanceService.createMaintenance(maintenanceDTO));
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<MaintenanceDTO>> completeMaintenance(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.completeMaintenance(id));
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getVehicleMaintenance(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceService.getVehicleMaintenance(vehicleId));
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getUpcomingMaintenance() {
        return ResponseEntity.ok(maintenanceService.getUpcomingMaintenance());
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<MaintenanceDTO>>> getOverdueMaintenance() {
        return ResponseEntity.ok(maintenanceService.getOverdueMaintenance());
    }
}