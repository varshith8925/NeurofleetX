// backend/src/main/java/com/neurofleetx/service/MaintenanceService.java
package com.neurofleetx.service;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.MaintenanceDTO;
import com.neurofleetx.entity.Maintenance;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.enums.MaintenanceStatus;
import com.neurofleetx.enums.VehicleStatus;
import com.neurofleetx.repository.MaintenanceRepository;
import com.neurofleetx.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {
    
    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    
    public ApiResponse<List<MaintenanceDTO>> getAllMaintenance() {
        List<MaintenanceDTO> maintenance = maintenanceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(maintenance);
    }
    
    public ApiResponse<MaintenanceDTO> getMaintenanceById(Long id) {
        Maintenance maintenance = maintenanceRepository.findById(id).orElse(null);
        if (maintenance == null) {
            return ApiResponse.error("Maintenance record not found");
        }
        return ApiResponse.success(mapToDTO(maintenance));
    }
    
    public ApiResponse<MaintenanceDTO> createMaintenance(MaintenanceDTO maintenanceDTO) {
        Vehicle vehicle = vehicleRepository.findById(maintenanceDTO.getVehicleId()).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }
        
        Maintenance maintenance = Maintenance.builder()
                .vehicle(vehicle)
                .maintenanceType(maintenanceDTO.getMaintenanceType())
                .description(maintenanceDTO.getDescription())
                .scheduledDate(maintenanceDTO.getScheduledDate())
                .status(MaintenanceStatus.SCHEDULED)
                .build();
        
        // Update vehicle status
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        vehicleRepository.save(vehicle);
        
        maintenanceRepository.save(maintenance);
        return ApiResponse.success(mapToDTO(maintenance));
    }
    
    public ApiResponse<MaintenanceDTO> completeMaintenance(Long id) {
        Maintenance maintenance = maintenanceRepository.findById(id).orElse(null);
        if (maintenance == null) {
            return ApiResponse.error("Maintenance record not found");
        }
        
        maintenance.setStatus(MaintenanceStatus.COMPLETED);
        maintenance.setCompletedDate(LocalDate.now());
        
        // Update vehicle status
        Vehicle vehicle = maintenance.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);
        
        maintenanceRepository.save(maintenance);
        return ApiResponse.success(mapToDTO(maintenance));
    }
    
    public ApiResponse<List<MaintenanceDTO>> getUpcomingMaintenance() {
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);
        
        List<MaintenanceDTO> upcoming = maintenanceRepository.findUpcoming(today, nextWeek).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(upcoming);
    }
    
    public ApiResponse<List<MaintenanceDTO>> getOverdueMaintenance() {
        List<MaintenanceDTO> overdue = maintenanceRepository.findOverdue(LocalDate.now()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(overdue);
    }
    
    public ApiResponse<List<MaintenanceDTO>> getVehicleMaintenance(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }
        
        List<MaintenanceDTO> maintenance = maintenanceRepository.findByVehicle(vehicle).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(maintenance);
    }
    
    private MaintenanceDTO mapToDTO(Maintenance maintenance) {
        return MaintenanceDTO.builder()
                .id(maintenance.getId())
                .vehicleId(maintenance.getVehicle().getId())
                .vehicleName(maintenance.getVehicle().getName())
                .vehicleLicensePlate(maintenance.getVehicle().getLicensePlate())
                .maintenanceType(maintenance.getMaintenanceType())
                .description(maintenance.getDescription())
                .scheduledDate(maintenance.getScheduledDate())
                .completedDate(maintenance.getCompletedDate())
                .status(maintenance.getStatus())
                .build();
    }
}