package com.neurofleetx.service;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.HealthMetricsDTO;
import com.neurofleetx.dto.VehicleHealthDTO;
import com.neurofleetx.entity.*;
import com.neurofleetx.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleHealthService {

    private final VehicleHealthRepository vehicleHealthRepository;
    private final VehicleRepository vehicleRepository;
    private final TelemetryRepository telemetryRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;

    public ApiResponse<List<VehicleHealthDTO>> getAllVehicleHealth() {
        List<VehicleHealth> healthList = vehicleHealthRepository.findAll();
        List<VehicleHealthDTO> dtos = healthList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(dtos);
    }

    public ApiResponse<VehicleHealthDTO> getVehicleHealth(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }

        Optional<VehicleHealth> health = vehicleHealthRepository.findByVehicle(vehicle);
        if (health.isPresent()) {
            return ApiResponse.success(mapToDTO(health.get()));
        }

        // If no health record exists, analyze and create one
        VehicleHealth newHealth = analyzeVehicleHealth(vehicle);
        return ApiResponse.success(mapToDTO(newHealth));
    }

    public ApiResponse<HealthMetricsDTO> getFleetHealthMetrics() {
        List<VehicleHealth> allHealth = vehicleHealthRepository.findAll();

        int totalVehicles = allHealth.size();
        int healthyVehicles = (int) allHealth.stream()
                .filter(vh -> vh.getOverallHealthScore() >= 80)
                .count();
        int vehiclesNeedingAttention = (int) allHealth.stream()
                .filter(vh -> vh.getOverallHealthScore() < 80 && vh.getOverallHealthScore() >= 50)
                .count();
        int criticalVehicles = (int) allHealth.stream()
                .filter(vh -> vh.getOverallHealthScore() < 50)
                .count();

        double averageHealth = allHealth.stream()
                .mapToDouble(VehicleHealth::getOverallHealthScore)
                .average()
                .orElse(0.0);

        List<VehicleHealth> maintenanceIn7Days = vehicleHealthRepository.findVehiclesNeedingMaintenanceSoon(7);
        List<VehicleHealth> maintenanceIn30Days = vehicleHealthRepository.findVehiclesNeedingMaintenanceSoon(30);
        List<VehicleHealth> vehiclesWithAnomalies = vehicleHealthRepository.findByHasAnomaliesTrue();
        List<VehicleHealth> highRiskVehicles = vehicleHealthRepository.findHighRiskVehicles();

        // Risk distribution
        Map<String, Integer> riskDistribution = new HashMap<>();
        riskDistribution.put("LOW", (int) allHealth.stream().filter(vh -> "LOW".equals(vh.getRiskLevel())).count());
        riskDistribution.put("MEDIUM",
                (int) allHealth.stream().filter(vh -> "MEDIUM".equals(vh.getRiskLevel())).count());
        riskDistribution.put("HIGH", (int) allHealth.stream().filter(vh -> "HIGH".equals(vh.getRiskLevel())).count());
        riskDistribution.put("CRITICAL",
                (int) allHealth.stream().filter(vh -> "CRITICAL".equals(vh.getRiskLevel())).count());

        // Health trend data (last 7 days)
        List<Map<String, Object>> trendData = generateHealthTrendData();

        HealthMetricsDTO metrics = HealthMetricsDTO.builder()
                .totalVehicles(totalVehicles)
                .healthyVehicles(healthyVehicles)
                .vehiclesNeedingAttention(vehiclesNeedingAttention)
                .criticalVehicles(criticalVehicles)
                .averageFleetHealth(Math.round(averageHealth * 10.0) / 10.0)
                .vehiclesNeedingMaintenanceIn7Days(maintenanceIn7Days.size())
                .vehiclesNeedingMaintenanceIn30Days(maintenanceIn30Days.size())
                .vehiclesWithAnomalies(vehiclesWithAnomalies.size())
                .criticalVehiclesList(
                        highRiskVehicles.stream().limit(5).map(this::mapToDTO).collect(Collectors.toList()))
                .upcomingMaintenanceList(
                        maintenanceIn7Days.stream().limit(10).map(this::mapToDTO).collect(Collectors.toList()))
                .riskDistribution(riskDistribution)
                .healthTrendData(trendData)
                .build();

        return ApiResponse.success(metrics);
    }

    @Transactional
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void analyzeAllVehiclesHealth() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        for (Vehicle vehicle : vehicles) {
            analyzeVehicleHealth(vehicle);
        }
    }

    @Transactional
    public VehicleHealth analyzeVehicleHealth(Vehicle vehicle) {
        // Get or create health record
        VehicleHealth health = vehicleHealthRepository.findByVehicle(vehicle)
                .orElse(VehicleHealth.builder().vehicle(vehicle).build());

        // Get latest telemetry
        Optional<Telemetry> latestTelemetry = telemetryRepository.findFirstByVehicleOrderByTimestampDesc(vehicle);

        // Calculate usage statistics
        List<Booking> completedTrips = bookingRepository.findAll().stream()
                .filter(b -> b.getVehicle().getId().equals(vehicle.getId()))
                .filter(b -> b.getStatus().name().equals("COMPLETED"))
                .collect(Collectors.toList());

        double totalDistance = completedTrips.stream()
                .mapToDouble(b -> b.getDistance() != null ? b.getDistance() : 0)
                .sum();

        int totalTrips = completedTrips.size();

        double averageSpeed = latestTelemetry.map(Telemetry::getSpeed).orElse(0.0);

        // Calculate days since last maintenance
        int daysSinceLastMaintenance = calculateDaysSinceLastMaintenance(vehicle);

        // Calculate health scores
        double engineHealth = calculateEngineHealth(latestTelemetry, daysSinceLastMaintenance, totalDistance);
        double brakeHealth = calculateBrakeHealth(totalDistance, daysSinceLastMaintenance);
        double tireHealth = calculateTireHealth(latestTelemetry, totalDistance);
        double batteryHealth = calculateBatteryHealth(latestTelemetry, vehicle);
        double transmissionHealth = calculateTransmissionHealth(totalDistance, daysSinceLastMaintenance);

        // Overall health score (weighted average)
        double overallHealth = (engineHealth * 0.3) +
                (brakeHealth * 0.25) +
                (tireHealth * 0.2) +
                (batteryHealth * 0.15) +
                (transmissionHealth * 0.1);

        // Predict maintenance days
        int predictedDays = predictMaintenanceDays(overallHealth, daysSinceLastMaintenance, totalDistance);

        // Determine risk level
        String riskLevel = determineRiskLevel(overallHealth, predictedDays);

        // Generate recommendations
        String recommendation = generateMaintenanceRecommendation(
                engineHealth, brakeHealth, tireHealth, batteryHealth, transmissionHealth, predictedDays);

        // Detect anomalies
        boolean hasAnomalies = detectAnomalies(latestTelemetry, overallHealth);
        String anomalyDetails = hasAnomalies ? generateAnomalyDetails(latestTelemetry, overallHealth) : null;

        // Update health record
        health.setOverallHealthScore(Math.round(overallHealth * 10.0) / 10.0);
        health.setEngineHealthScore(Math.round(engineHealth * 10.0) / 10.0);
        health.setBrakeHealthScore(Math.round(brakeHealth * 10.0) / 10.0);
        health.setTireHealthScore(Math.round(tireHealth * 10.0) / 10.0);
        health.setBatteryHealthScore(Math.round(batteryHealth * 10.0) / 10.0);
        health.setTransmissionHealthScore(Math.round(transmissionHealth * 10.0) / 10.0);
        health.setPredictedMaintenanceDays(predictedDays);
        health.setMaintenanceRecommendation(recommendation);
        health.setRiskLevel(riskLevel);
        health.setTotalDistanceCovered(Math.round(totalDistance * 10.0) / 10.0);
        health.setTotalTripsCompleted(totalTrips);
        health.setAverageSpeed(Math.round(averageSpeed * 10.0) / 10.0);
        health.setDaysSinceLastMaintenance(daysSinceLastMaintenance);
        health.setHasAnomalies(hasAnomalies);
        health.setAnomalyDetails(anomalyDetails);
        health.setLastAnalysis(LocalDateTime.now());

        return vehicleHealthRepository.save(health);
    }

    private double calculateEngineHealth(Optional<Telemetry> telemetry, int daysSinceMaintenance,
            double totalDistance) {
        double health = 100.0;

        if (telemetry.isPresent()) {
            Double engineTemp = telemetry.get().getEngineTemp();
            if (engineTemp != null) {
                if (engineTemp > 95)
                    health -= 30;
                else if (engineTemp > 85)
                    health -= 15;
                else if (engineTemp > 75)
                    health -= 5;
            }
        }

        // Degrade based on days since maintenance
        if (daysSinceMaintenance > 365)
            health -= 40;
        else if (daysSinceMaintenance > 180)
            health -= 20;
        else if (daysSinceMaintenance > 90)
            health -= 10;

        // Degrade based on distance
        if (totalDistance > 100000)
            health -= 25;
        else if (totalDistance > 50000)
            health -= 15;
        else if (totalDistance > 25000)
            health -= 5;

        return Math.max(0, Math.min(100, health));
    }

    private double calculateBrakeHealth(double totalDistance, int daysSinceMaintenance) {
        double health = 100.0;

        if (totalDistance > 80000)
            health -= 35;
        else if (totalDistance > 40000)
            health -= 20;
        else if (totalDistance > 20000)
            health -= 10;

        if (daysSinceMaintenance > 365)
            health -= 30;
        else if (daysSinceMaintenance > 180)
            health -= 15;

        return Math.max(0, Math.min(100, health));
    }

    private double calculateTireHealth(Optional<Telemetry> telemetry, double totalDistance) {
        double health = 100.0;

        if (telemetry.isPresent() && telemetry.get().getTirePressure() != null) {
            double pressure = telemetry.get().getTirePressure();
            if (pressure < 28 || pressure > 36)
                health -= 25;
            else if (pressure < 30 || pressure > 34)
                health -= 10;
        }

        if (totalDistance > 60000)
            health -= 40;
        else if (totalDistance > 30000)
            health -= 20;
        else if (totalDistance > 15000)
            health -= 10;

        return Math.max(0, Math.min(100, health));
    }

    private double calculateBatteryHealth(Optional<Telemetry> telemetry, Vehicle vehicle) {
        double health = 100.0;

        if (telemetry.isPresent() && telemetry.get().getBatteryLevel() != null) {
            double batteryLevel = telemetry.get().getBatteryLevel();
            if (batteryLevel < 70)
                health -= 30;
            else if (batteryLevel < 85)
                health -= 15;
        }

        // EV batteries degrade over time
        if ("ELECTRIC".equals(vehicle.getFuelType().name())) {
            // Assume 2% degradation per year (simple model)
            health -= 5; // Placeholder
        }

        return Math.max(0, Math.min(100, health));
    }

    private double calculateTransmissionHealth(double totalDistance, int daysSinceMaintenance) {
        double health = 100.0;

        if (totalDistance > 100000)
            health -= 30;
        else if (totalDistance > 50000)
            health -= 15;

        if (daysSinceMaintenance > 365)
            health -= 25;
        else if (daysSinceMaintenance > 180)
            health -= 10;

        return Math.max(0, Math.min(100, health));
    }

    private int predictMaintenanceDays(double overallHealth, int daysSinceMaintenance, double totalDistance) {
        // Base prediction on health score
        int baseDays;

        if (overallHealth >= 90)
            baseDays = 180;
        else if (overallHealth >= 75)
            baseDays = 90;
        else if (overallHealth >= 60)
            baseDays = 45;
        else if (overallHealth >= 40)
            baseDays = 14;
        else
            baseDays = 3;

        // Adjust based on recent maintenance
        if (daysSinceMaintenance < 30)
            baseDays += 60;
        else if (daysSinceMaintenance > 300)
            baseDays = Math.max(7, baseDays - 30);

        return baseDays;
    }

    private String determineRiskLevel(double overallHealth, int predictedDays) {
        if (overallHealth < 40 || predictedDays <= 7)
            return "CRITICAL";
        if (overallHealth < 60 || predictedDays <= 14)
            return "HIGH";
        if (overallHealth < 75 || predictedDays <= 30)
            return "MEDIUM";
        return "LOW";
    }

    private String generateMaintenanceRecommendation(
            double engine, double brake, double tire, double battery, double transmission, int days) {

        List<String> recommendations = new ArrayList<>();

        if (engine < 60)
            recommendations.add("🔧 Engine service required");
        else if (engine < 75)
            recommendations.add("🔍 Engine inspection recommended");

        if (brake < 60)
            recommendations.add("🛑 Brake replacement needed");
        else if (brake < 75)
            recommendations.add("🛑 Brake check recommended");

        if (tire < 60)
            recommendations.add("🔘 Tire replacement required");
        else if (tire < 75)
            recommendations.add("🔘 Tire rotation recommended");

        if (battery < 60)
            recommendations.add("🔋 Battery replacement needed");
        else if (battery < 75)
            recommendations.add("🔋 Battery check recommended");

        if (transmission < 60)
            recommendations.add("⚙️ Transmission service required");

        if (recommendations.isEmpty()) {
            return "✅ Vehicle is in good condition. Next service in " + days + " days.";
        }

        return String.join(" | ", recommendations) + " | Schedule maintenance within " + days + " days.";
    }

    private boolean detectAnomalies(Optional<Telemetry> telemetry, double overallHealth) {
        if (telemetry.isEmpty())
            return false;

        Telemetry t = telemetry.get();

        // Check for sudden health drop
        if (overallHealth < 50)
            return true;

        // Check telemetry anomalies
        if (t.getEngineTemp() != null && t.getEngineTemp() > 100)
            return true;
        if (t.getSpeed() != null && t.getSpeed() > 120)
            return true;
        if (t.getTirePressure() != null && (t.getTirePressure() < 25 || t.getTirePressure() > 40))
            return true;
        if (t.getFuelLevel() != null && t.getFuelLevel() < 10)
            return true;

        return false;
    }

    private String generateAnomalyDetails(Optional<Telemetry> telemetry, double overallHealth) {
        if (telemetry.isEmpty())
            return "No telemetry data available";

        List<String> anomalies = new ArrayList<>();
        Telemetry t = telemetry.get();

        if (overallHealth < 50)
            anomalies.add("⚠️ Critical health score: " + String.format("%.1f", overallHealth) + "%");
        if (t.getEngineTemp() != null && t.getEngineTemp() > 100)
            anomalies.add("🌡️ Engine overheating: " + t.getEngineTemp() + "°C");
        if (t.getSpeed() != null && t.getSpeed() > 120)
            anomalies.add("🚨 Excessive speed: " + t.getSpeed() + " km/h");
        if (t.getTirePressure() != null && (t.getTirePressure() < 25 || t.getTirePressure() > 40))
            anomalies.add("🔘 Abnormal tire pressure: " + t.getTirePressure() + " PSI");
        if (t.getFuelLevel() != null && t.getFuelLevel() < 10)
            anomalies.add("⛽ Critical fuel level: " + t.getFuelLevel() + "%");

        return String.join(" | ", anomalies);
    }

    private int calculateDaysSinceLastMaintenance(Vehicle vehicle) {
        Optional<Maintenance> lastMaintenance = maintenanceRepository.findByVehicle(vehicle).stream()
                .filter(m -> m.getCompletedDate() != null)
                .max(Comparator.comparing(Maintenance::getCompletedDate));

        if (lastMaintenance.isPresent()) {
            return (int) ChronoUnit.DAYS.between(lastMaintenance.get().getCompletedDate(), LocalDate.now());
        }

        return 365; // Default to 1 year if no maintenance record
    }

    private List<Map<String, Object>> generateHealthTrendData() {
        List<Map<String, Object>> trendData = new ArrayList<>();
        String[] days = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };

        for (String day : days) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("day", day);
            entry.put("averageHealth", 75 + Math.random() * 20); // Placeholder - would come from actual data
            entry.put("vehiclesChecked", (int) (Math.random() * 50) + 10);
            trendData.add(entry);
        }

        return trendData;
    }

    private VehicleHealthDTO mapToDTO(VehicleHealth health) {
        return VehicleHealthDTO.builder()
                .id(health.getId())
                .vehicleId(health.getVehicle().getId())
                .vehicleName(health.getVehicle().getName())
                .vehicleModel(health.getVehicle().getModel())
                .licensePlate(health.getVehicle().getLicensePlate())
                .overallHealthScore(health.getOverallHealthScore())
                .engineHealthScore(health.getEngineHealthScore())
                .brakeHealthScore(health.getBrakeHealthScore())
                .tireHealthScore(health.getTireHealthScore())
                .batteryHealthScore(health.getBatteryHealthScore())
                .transmissionHealthScore(health.getTransmissionHealthScore())
                .predictedMaintenanceDays(health.getPredictedMaintenanceDays())
                .maintenanceRecommendation(health.getMaintenanceRecommendation())
                .riskLevel(health.getRiskLevel())
                .totalDistanceCovered(health.getTotalDistanceCovered())
                .totalTripsCompleted(health.getTotalTripsCompleted())
                .averageSpeed(health.getAverageSpeed())
                .daysSinceLastMaintenance(health.getDaysSinceLastMaintenance())
                .hasAnomalies(health.getHasAnomalies())
                .anomalyDetails(health.getAnomalyDetails())
                .lastAnalysis(health.getLastAnalysis())
                .build();
    }
}