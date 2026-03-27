// backend/src/main/java/com/neurofleetx/repository/MaintenanceRepository.java
package com.neurofleetx.repository;

import com.neurofleetx.entity.Maintenance;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByVehicle(Vehicle vehicle);

    List<Maintenance> findByStatus(MaintenanceStatus status);

    @Query("SELECT m FROM Maintenance m WHERE m.scheduledDate <= :date AND m.status != 'COMPLETED'")
    List<Maintenance> findOverdue(LocalDate date);

    @Query("SELECT m FROM Maintenance m WHERE m.scheduledDate BETWEEN :startDate AND :endDate AND m.status = 'SCHEDULED'")
    List<Maintenance> findUpcoming(LocalDate startDate, LocalDate endDate);
}