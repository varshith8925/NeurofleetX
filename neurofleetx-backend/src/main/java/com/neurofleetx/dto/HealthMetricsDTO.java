package com.neurofleetx.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthMetricsDTO {
    private Integer totalVehicles;
    private Integer healthyVehicles;
    private Integer vehiclesNeedingAttention;
    private Integer criticalVehicles;
    private Double averageFleetHealth;

    private Integer vehiclesNeedingMaintenanceIn7Days;
    private Integer vehiclesNeedingMaintenanceIn30Days;
    private Integer vehiclesWithAnomalies;

    private List<VehicleHealthDTO> criticalVehiclesList;
    private List<VehicleHealthDTO> upcomingMaintenanceList;

    private Map<String, Integer> riskDistribution;
    private List<Map<String, Object>> healthTrendData;
}