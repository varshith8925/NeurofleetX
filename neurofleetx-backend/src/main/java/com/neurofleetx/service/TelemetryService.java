package com.neurofleetx.service;

import com.neurofleetx.dto.AlertDTO;
import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.TelemetryDTO;
import com.neurofleetx.entity.Alert;
import com.neurofleetx.entity.Telemetry;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.enums.AlertType;
import com.neurofleetx.repository.AlertRepository;
import com.neurofleetx.repository.TelemetryRepository;
import com.neurofleetx.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final TelemetryRepository telemetryRepository;
    private final VehicleRepository vehicleRepository;
    private final AlertRepository alertRepository;

    // Alert thresholds
    private static final double SPEED_LIMIT = 80.0;
    private static final double FUEL_WARNING = 30.0;
    private static final double TEMP_WARNING = 70.0;

    public ApiResponse<TelemetryDTO> getLatestTelemetry(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }

        Optional<Telemetry> telemetry = telemetryRepository.findFirstByVehicleOrderByTimestampDesc(vehicle);

        if (telemetry.isEmpty()) {
            // Return empty telemetry with vehicle info
            TelemetryDTO emptyTelemetry = TelemetryDTO.builder()
                    .vehicleId(vehicle.getId())
                    .vehicleName(vehicle.getName())
                    .latitude(vehicle.getLatitude())
                    .longitude(vehicle.getLongitude())
                    .speed(0.0)
                    .fuelLevel(100.0)
                    .engineTemp(70.0)
                    .tirePressure(32.0)
                    .batteryLevel(100.0)
                    .timestamp(LocalDateTime.now())
                    .build();
            return ApiResponse.success(emptyTelemetry);
        }

        return ApiResponse.success(mapToDTO(telemetry.get()));
    }

    public ApiResponse<List<TelemetryDTO>> getAllLatestTelemetry() {
        List<Telemetry> telemetryList = telemetryRepository.findLatestForAllVehicles();
        List<TelemetryDTO> dtos = telemetryList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(dtos);
    }

    public ApiResponse<List<AlertDTO>> getAlerts() {
        List<Alert> alerts = alertRepository.findByAcknowledgedFalseOrderByTimestampDesc();
        List<AlertDTO> dtos = alerts.stream()
                .map(this::mapAlertToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(dtos);
    }

    public ApiResponse<List<TelemetryDTO>> getOverspeedingVehicles() {
        List<Telemetry> overspeeding = telemetryRepository.findOverspeedingVehicles(SPEED_LIMIT);
        List<TelemetryDTO> dtos = overspeeding.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(dtos);
    }

    @Transactional
    public ApiResponse<TelemetryDTO> updateTelemetry(Long vehicleId, TelemetryDTO telemetryDTO) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }

        // Check if telemetry already exists for this vehicle
        Optional<Telemetry> existingTelemetry = telemetryRepository.findFirstByVehicleOrderByTimestampDesc(vehicle);

        Telemetry telemetry;
        if (existingTelemetry.isPresent()) {
            // Update existing telemetry
            telemetry = existingTelemetry.get();
            telemetry.setLatitude(telemetryDTO.getLatitude());
            telemetry.setLongitude(telemetryDTO.getLongitude());
            telemetry.setSpeed(telemetryDTO.getSpeed());
            telemetry.setFuelLevel(telemetryDTO.getFuelLevel());
            telemetry.setEngineTemp(telemetryDTO.getEngineTemp());
            telemetry.setTirePressure(telemetryDTO.getTirePressure());
            telemetry.setBatteryLevel(telemetryDTO.getBatteryLevel());
            telemetry.setTimestamp(LocalDateTime.now());
        } else {
            // Create new telemetry
            telemetry = Telemetry.builder()
                    .vehicle(vehicle)
                    .latitude(telemetryDTO.getLatitude())
                    .longitude(telemetryDTO.getLongitude())
                    .speed(telemetryDTO.getSpeed())
                    .fuelLevel(telemetryDTO.getFuelLevel())
                    .engineTemp(telemetryDTO.getEngineTemp())
                    .tirePressure(telemetryDTO.getTirePressure())
                    .batteryLevel(telemetryDTO.getBatteryLevel())
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        telemetryRepository.save(telemetry);

        // Update vehicle location
        vehicle.setLatitude(telemetryDTO.getLatitude());
        vehicle.setLongitude(telemetryDTO.getLongitude());
        vehicleRepository.save(vehicle);

        // Check and create alerts
        checkAndCreateAlerts(vehicle, telemetryDTO);

        return ApiResponse.success("Telemetry updated successfully", mapToDTO(telemetry));
    }

    private void checkAndCreateAlerts(Vehicle vehicle, TelemetryDTO telemetryDTO) {
        // Check overspeeding (Speed > 80 km/h)
        if (telemetryDTO.getSpeed() != null && telemetryDTO.getSpeed() > SPEED_LIMIT) {
            createOrUpdateAlert(vehicle, AlertType.OVERSPEEDING,
                    "⚠️ Vehicle overspeeding: " + String.format("%.1f", telemetryDTO.getSpeed())
                            + " km/h (Limit: 80 km/h)");
        } else {
            // Remove overspeeding alert if speed is normal
            acknowledgeAlertIfExists(vehicle, AlertType.OVERSPEEDING);
        }

        // Check low fuel (Fuel < 30%)
        if (telemetryDTO.getFuelLevel() != null && telemetryDTO.getFuelLevel() < FUEL_WARNING) {
            createOrUpdateAlert(vehicle, AlertType.LOW_FUEL,
                    "⛽ Low fuel level: " + String.format("%.1f", telemetryDTO.getFuelLevel())
                            + "% (Warning below 30%)");
        } else {
            acknowledgeAlertIfExists(vehicle, AlertType.LOW_FUEL);
        }

        // Check high engine temperature (Temp > 70°C)
        if (telemetryDTO.getEngineTemp() != null && telemetryDTO.getEngineTemp() > TEMP_WARNING) {
            createOrUpdateAlert(vehicle, AlertType.HIGH_ENGINE_TEMP,
                    "🌡️ High engine temperature: " + String.format("%.1f", telemetryDTO.getEngineTemp())
                            + "°C (Warning above 70°C)");
        } else {
            acknowledgeAlertIfExists(vehicle, AlertType.HIGH_ENGINE_TEMP);
        }

        // Check low tire pressure (< 28 PSI)
        if (telemetryDTO.getTirePressure() != null && telemetryDTO.getTirePressure() < 28) {
            createOrUpdateAlert(vehicle, AlertType.LOW_TIRE_PRESSURE,
                    "🚗 Low tire pressure: " + String.format("%.1f", telemetryDTO.getTirePressure()) + " PSI");
        } else {
            acknowledgeAlertIfExists(vehicle, AlertType.LOW_TIRE_PRESSURE);
        }
    }

    private void createOrUpdateAlert(Vehicle vehicle, AlertType type, String message) {
        // Check if alert already exists for this vehicle and type
        Optional<Alert> existingAlert = alertRepository.findByVehicleAndTypeAndAcknowledgedFalse(vehicle, type);

        if (existingAlert.isPresent()) {
            // Update existing alert
            Alert alert = existingAlert.get();
            alert.setMessage(message);
            alert.setTimestamp(LocalDateTime.now());
            alertRepository.save(alert);
        } else {
            // Create new alert
            Alert alert = Alert.builder()
                    .vehicle(vehicle)
                    .type(type)
                    .message(message)
                    .acknowledged(false)
                    .timestamp(LocalDateTime.now())
                    .build();
            alertRepository.save(alert);
        }
    }

    private void acknowledgeAlertIfExists(Vehicle vehicle, AlertType type) {
        Optional<Alert> existingAlert = alertRepository.findByVehicleAndTypeAndAcknowledgedFalse(vehicle, type);
        if (existingAlert.isPresent()) {
            Alert alert = existingAlert.get();
            alert.setAcknowledged(true);
            alertRepository.save(alert);
        }
    }

    @Transactional
    public ApiResponse<Void> acknowledgeAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId).orElse(null);
        if (alert == null) {
            return ApiResponse.error("Alert not found");
        }
        alert.setAcknowledged(true);
        alertRepository.save(alert);
        return ApiResponse.success("Alert acknowledged", null);
    }

    private TelemetryDTO mapToDTO(Telemetry telemetry) {
        return TelemetryDTO.builder()
                .id(telemetry.getId())
                .vehicleId(telemetry.getVehicle().getId())
                .vehicleName(telemetry.getVehicle().getName())
                .latitude(telemetry.getLatitude())
                .longitude(telemetry.getLongitude())
                .speed(telemetry.getSpeed())
                .fuelLevel(telemetry.getFuelLevel())
                .engineTemp(telemetry.getEngineTemp())
                .tirePressure(telemetry.getTirePressure())
                .batteryLevel(telemetry.getBatteryLevel())
                .timestamp(telemetry.getTimestamp())
                .build();
    }

    private AlertDTO mapAlertToDTO(Alert alert) {
        return AlertDTO.builder()
                .id(alert.getId())
                .vehicleId(alert.getVehicle().getId())
                .vehicleName(alert.getVehicle().getName())
                .type(alert.getType())
                .message(alert.getMessage())
                .acknowledged(alert.getAcknowledged())
                .timestamp(alert.getTimestamp())
                .build();
    }
}