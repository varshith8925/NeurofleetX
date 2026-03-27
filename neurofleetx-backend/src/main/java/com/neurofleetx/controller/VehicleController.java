// backend/src/main/java/com/neurofleetx/controller/VehicleController.java
package com.neurofleetx.controller;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.StatsDTO;
import com.neurofleetx.dto.VehicleDTO;
import com.neurofleetx.enums.VehicleStatus;
import com.neurofleetx.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    
    private final VehicleService vehicleService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDTO>> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<VehicleDTO>> createVehicle(@RequestBody VehicleDTO vehicleDTO) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicleDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDTO>> updateVehicle(@PathVariable Long id, @RequestBody VehicleDTO vehicleDTO) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicleDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.deleteVehicle(id));
    }
    
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getVehiclesByStatus(@PathVariable VehicleStatus status) {
        return ResponseEntity.ok(vehicleService.getVehiclesByStatus(status));
    }
    
    @PutMapping("/{vehicleId}/assign/{driverId}")
    public ResponseEntity<ApiResponse<VehicleDTO>> assignDriver(@PathVariable Long vehicleId, @PathVariable Long driverId) {
        return ResponseEntity.ok(vehicleService.assignDriver(vehicleId, driverId));
    }
    
    @PutMapping("/{vehicleId}/unassign")
    public ResponseEntity<ApiResponse<VehicleDTO>> unassignDriver(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleService.unassignDriver(vehicleId));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatsDTO>> getVehicleStats() {
        return ResponseEntity.ok(vehicleService.getVehicleStats());
    }
}