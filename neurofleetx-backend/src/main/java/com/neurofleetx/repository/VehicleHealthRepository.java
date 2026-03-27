package com.neurofleetx.repository;

import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.entity.VehicleHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleHealthRepository extends JpaRepository<VehicleHealth, Long> {

    Optional<VehicleHealth> findByVehicle(Vehicle vehicle);

    @Query("SELECT vh FROM VehicleHealth vh WHERE vh.overallHealthScore < :threshold ORDER BY vh.overallHealthScore ASC")
    List<VehicleHealth> findVehiclesWithLowHealth(Double threshold);

    @Query("SELECT vh FROM VehicleHealth vh WHERE vh.riskLevel = 'HIGH' OR vh.riskLevel = 'CRITICAL' ORDER BY vh.lastAnalysis DESC")
    List<VehicleHealth> findHighRiskVehicles();

    @Query("SELECT vh FROM VehicleHealth vh WHERE vh.predictedMaintenanceDays <= :days ORDER BY vh.predictedMaintenanceDays ASC")
    List<VehicleHealth> findVehiclesNeedingMaintenanceSoon(Integer days);

    List<VehicleHealth> findByHasAnomaliesTrue();
}