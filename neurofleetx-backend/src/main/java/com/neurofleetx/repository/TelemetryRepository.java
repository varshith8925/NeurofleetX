package com.neurofleetx.repository;

import com.neurofleetx.entity.Telemetry;
import com.neurofleetx.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {

    List<Telemetry> findByVehicleOrderByTimestampDesc(Vehicle vehicle);

    Optional<Telemetry> findFirstByVehicleOrderByTimestampDesc(Vehicle vehicle);

    @Query("SELECT t FROM Telemetry t WHERE t.id IN " +
            "(SELECT MAX(t2.id) FROM Telemetry t2 GROUP BY t2.vehicle)")
    List<Telemetry> findLatestForAllVehicles();

    @Query("SELECT t FROM Telemetry t WHERE t.speed > :speedLimit AND t.id IN " +
            "(SELECT MAX(t2.id) FROM Telemetry t2 GROUP BY t2.vehicle)")
    List<Telemetry> findOverspeedingVehicles(Double speedLimit);

    Optional<Telemetry> findByVehicle(Vehicle vehicle);
}