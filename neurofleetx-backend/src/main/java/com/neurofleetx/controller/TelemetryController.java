package com.neurofleetx.controller;

import com.neurofleetx.dto.AlertDTO;
import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.TelemetryDTO;
import com.neurofleetx.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class TelemetryController {

    private final TelemetryService telemetryService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<TelemetryDTO>> getVehicleTelemetry(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(telemetryService.getLatestTelemetry(vehicleId));
    }

    @GetMapping("/vehicle/{vehicleId}/latest")
    public ResponseEntity<ApiResponse<TelemetryDTO>> getLatestTelemetry(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(telemetryService.getLatestTelemetry(vehicleId));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<TelemetryDTO>>> getAllLatestTelemetry() {
        return ResponseEntity.ok(telemetryService.getAllLatestTelemetry());
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<AlertDTO>>> getAlerts() {
        return ResponseEntity.ok(telemetryService.getAlerts());
    }

    @GetMapping("/overspeeding")
    public ResponseEntity<ApiResponse<List<TelemetryDTO>>> getOverspeedingVehicles() {
        return ResponseEntity.ok(telemetryService.getOverspeedingVehicles());
    }

    @PutMapping("/vehicle/{vehicleId}/update")
    public ResponseEntity<ApiResponse<TelemetryDTO>> updateTelemetry(
            @PathVariable Long vehicleId,
            @RequestBody TelemetryDTO telemetryDTO) {
        return ResponseEntity.ok(telemetryService.updateTelemetry(vehicleId, telemetryDTO));
    }

    @PutMapping("/alerts/{alertId}/acknowledge")
    public ResponseEntity<ApiResponse<Void>> acknowledgeAlert(@PathVariable Long alertId) {
        return ResponseEntity.ok(telemetryService.acknowledgeAlert(alertId));
    }
}