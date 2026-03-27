// backend/src/main/java/com/neurofleetx/dto/MaintenanceDTO.java
package com.neurofleetx.dto;

import com.neurofleetx.enums.MaintenanceStatus;
import com.neurofleetx.enums.MaintenanceType;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceDTO {
    private Long id;
    private Long vehicleId;
    private String vehicleName;
    private String vehicleLicensePlate;
    private MaintenanceType maintenanceType;
    private String description;
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private MaintenanceStatus status;
}