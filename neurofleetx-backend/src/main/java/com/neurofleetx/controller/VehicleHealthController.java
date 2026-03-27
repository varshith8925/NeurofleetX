package com.neurofleetx.controller;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.HealthMetricsDTO;
import com.neurofleetx.dto.VehicleHealthDTO;
import com.neurofleetx.service.VehicleHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class VehicleHealthController {

    private final VehicleHealthService vehicleHealthService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleHealthDTO>>> getAllVehicleHealth() {
        return ResponseEntity.ok(vehicleHealthService.getAllVehicleHealth());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<VehicleHealthDTO>> getVehicleHealth(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleHealthService.getVehicleHealth(vehicleId));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<HealthMetricsDTO>> getFleetHealthMetrics() {
        return ResponseEntity.ok(vehicleHealthService.getFleetHealthMetrics());
    }

    @PostMapping("/analyze/{vehicleId}")
    public ResponseEntity<ApiResponse<VehicleHealthDTO>> analyzeVehicleHealth(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleHealthService.getVehicleHealth(vehicleId));
    }

    @PostMapping("/analyze-all")
    public ResponseEntity<ApiResponse<String>> analyzeAllVehicles() {
        vehicleHealthService.analyzeAllVehiclesHealth();
        return ResponseEntity.ok(ApiResponse.success("Fleet health analysis completed successfully"));
    }
}