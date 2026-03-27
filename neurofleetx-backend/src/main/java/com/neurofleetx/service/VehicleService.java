// backend/src/main/java/com/neurofleetx/service/VehicleService.java
package com.neurofleetx.service;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.StatsDTO;
import com.neurofleetx.dto.VehicleDTO;
import com.neurofleetx.entity.User;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.enums.VehicleStatus;
import com.neurofleetx.repository.TelemetryRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {
    
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final TelemetryRepository telemetryRepository;
    
    public ApiResponse<List<VehicleDTO>> getAllVehicles() {
        List<VehicleDTO> vehicles = vehicleRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(vehicles);
    }
    
    public ApiResponse<VehicleDTO> getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }
        return ApiResponse.success(mapToDTO(vehicle));
    }
    
    public ApiResponse<VehicleDTO> createVehicle(VehicleDTO vehicleDTO) {
        if (vehicleRepository.existsByLicensePlate(vehicleDTO.getLicensePlate())) {
            return ApiResponse.error("License plate already exists");
        }
        
        Vehicle vehicle = Vehicle.builder()
                .name(vehicleDTO.getName())
                .model(vehicleDTO.getModel())
                .color(vehicleDTO.getColor())
                .licensePlate(vehicleDTO.getLicensePlate())
                .vehicleType(vehicleDTO.getVehicleType())
                .seats(vehicleDTO.getSeats())
                .fuelType(vehicleDTO.getFuelType())
                .status(vehicleDTO.getStatus() != null ? vehicleDTO.getStatus() : VehicleStatus.AVAILABLE)
                .latitude(vehicleDTO.getLatitude())
                .longitude(vehicleDTO.getLongitude())
                .build();
        
        vehicleRepository.save(vehicle);
        return ApiResponse.success(mapToDTO(vehicle));
    }
    
    public ApiResponse<VehicleDTO> updateVehicle(Long id, VehicleDTO vehicleDTO) {
        Vehicle vehicle = vehicleRepository.findById(id).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }
        
        vehicle.setName(vehicleDTO.getName());
        vehicle.setModel(vehicleDTO.getModel());
        vehicle.setColor(vehicleDTO.getColor());
        vehicle.setLicensePlate(vehicleDTO.getLicensePlate());
        vehicle.setVehicleType(vehicleDTO.getVehicleType());
        vehicle.setSeats(vehicleDTO.getSeats());
        vehicle.setFuelType(vehicleDTO.getFuelType());
        vehicle.setStatus(vehicleDTO.getStatus());
        vehicle.setLatitude(vehicleDTO.getLatitude());
        vehicle.setLongitude(vehicleDTO.getLongitude());
        
        vehicleRepository.save(vehicle);
        return ApiResponse.success(mapToDTO(vehicle));
    }
    
    public ApiResponse<Void> deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            return ApiResponse.error("Vehicle not found");
        }
        vehicleRepository.deleteById(id);
        return ApiResponse.success("Vehicle deleted successfully", null);
    }
    
    public ApiResponse<List<VehicleDTO>> getAvailableVehicles() {
        List<VehicleDTO> vehicles = vehicleRepository.findByStatus(VehicleStatus.AVAILABLE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(vehicles);
    }
    
    public ApiResponse<List<VehicleDTO>> getVehiclesByStatus(VehicleStatus status) {
        List<VehicleDTO> vehicles = vehicleRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(vehicles);
    }
    
    public ApiResponse<VehicleDTO> assignDriver(Long vehicleId, Long driverId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }
        
        User driver = userRepository.findById(driverId).orElse(null);
        if (driver == null) {
            return ApiResponse.error("Driver not found");
        }
        
        vehicle.setDriver(driver);
        driver.setAvailable(false);
        
        vehicleRepository.save(vehicle);
        userRepository.save(driver);
        
        return ApiResponse.success(mapToDTO(vehicle));
    }
    
    public ApiResponse<VehicleDTO> unassignDriver(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }
        
        if (vehicle.getDriver() != null) {
            User driver = vehicle.getDriver();
            driver.setAvailable(true);
            userRepository.save(driver);
        }
        
        vehicle.setDriver(null);
        vehicleRepository.save(vehicle);
        
        return ApiResponse.success(mapToDTO(vehicle));
    }
    
    public ApiResponse<StatsDTO> getVehicleStats() {
        StatsDTO stats = StatsDTO.builder()
                .total((long) vehicleRepository.findAll().size())
                .available(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE))
                .inUse(vehicleRepository.countByStatus(VehicleStatus.IN_USE))
                .maintenance(vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE))
                .outOfService(vehicleRepository.countByStatus(VehicleStatus.OUT_OF_SERVICE))
                .build();
        return ApiResponse.success(stats);
    }
    
    private VehicleDTO mapToDTO(Vehicle vehicle) {
        VehicleDTO dto = VehicleDTO.builder()
                .id(vehicle.getId())
                .name(vehicle.getName())
                .model(vehicle.getModel())
                .color(vehicle.getColor())
                .licensePlate(vehicle.getLicensePlate())
                .vehicleType(vehicle.getVehicleType())
                .seats(vehicle.getSeats())
                .fuelType(vehicle.getFuelType())
                .status(vehicle.getStatus())
                .latitude(vehicle.getLatitude())
                .longitude(vehicle.getLongitude())
                .build();
        
        if (vehicle.getDriver() != null) {
            dto.setDriverId(vehicle.getDriver().getId());
            dto.setDriverName(vehicle.getDriver().getName());
        }
        
        // Get latest telemetry for speed
        telemetryRepository.findFirstByVehicleOrderByTimestampDesc(vehicle)
                .ifPresent(telemetry -> dto.setSpeed(telemetry.getSpeed()));
        
        return dto;
    }
}