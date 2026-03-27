package com.neurofleetx.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_health")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleHealth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Health Scores (0-100)
    private Double overallHealthScore;
    private Double engineHealthScore;
    private Double brakeHealthScore;
    private Double tireHealthScore;
    private Double batteryHealthScore;
    private Double transmissionHealthScore;

    // Maintenance Predictions
    private Integer predictedMaintenanceDays; // Days until maintenance needed
    private String maintenanceRecommendation;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    // Vehicle Usage Statistics
    private Double totalDistanceCovered; // in km
    private Integer totalTripsCompleted;
    private Double averageSpeed;
    private Integer daysSinceLastMaintenance;

    // Anomaly Detection
    private Boolean hasAnomalies;
    private String anomalyDetails;

    private LocalDateTime lastAnalysis;
}