// backend/src/main/java/com/neurofleetx/repository/VehicleRepository.java
package com.neurofleetx.repository;

import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByStatusAndDriverIsNull(VehicleStatus status);
    long countByStatus(VehicleStatus status);
    boolean existsByLicensePlate(String licensePlate);
}