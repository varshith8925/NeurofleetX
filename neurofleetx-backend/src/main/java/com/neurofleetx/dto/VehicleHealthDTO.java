package com.neurofleetx.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleHealthDTO {
    private Long id;
    private Long vehicleId;
    private String vehicleName;
    private String vehicleModel;
    private String licensePlate;

    // Health Scores
    private Double overallHealthScore;
    private Double engineHealthScore;
    private Double brakeHealthScore;
    private Double tireHealthScore;
    private Double batteryHealthScore;
    private Double transmissionHealthScore;

    // Predictions
    private Integer predictedMaintenanceDays;
    private String maintenanceRecommendation;
    private String riskLevel;

    // Statistics
    private Double totalDistanceCovered;
    private Integer totalTripsCompleted;
    private Double averageSpeed;
    private Integer daysSinceLastMaintenance;

    // Anomalies
    private Boolean hasAnomalies;
    private String anomalyDetails;

    private LocalDateTime lastAnalysis;
}