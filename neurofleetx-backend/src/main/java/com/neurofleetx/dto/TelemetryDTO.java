// backend/src/main/java/com/neurofleetx/dto/TelemetryDTO.java
package com.neurofleetx.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryDTO {
    private Long id;
    private Long vehicleId;
    private String vehicleName;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double fuelLevel;
    private Double engineTemp;
    private Double tirePressure;
    private Double batteryLevel;
    private LocalDateTime timestamp;
}