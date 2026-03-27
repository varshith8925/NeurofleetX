package com.neurofleetx.repository;

import com.neurofleetx.entity.Alert;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.enums.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByAcknowledgedFalseOrderByTimestampDesc();

    List<Alert> findTop10ByOrderByTimestampDesc();

    Optional<Alert> findByVehicleAndTypeAndAcknowledgedFalse(Vehicle vehicle, AlertType type);

    List<Alert> findByVehicleOrderByTimestampDesc(Vehicle vehicle);

    List<Alert> findByVehicleAndAcknowledgedFalse(Vehicle vehicle);
}