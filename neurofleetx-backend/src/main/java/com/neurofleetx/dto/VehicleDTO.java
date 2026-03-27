// backend/src/main/java/com/neurofleetx/dto/VehicleDTO.java
package com.neurofleetx.dto;

import com.neurofleetx.enums.FuelType;
import com.neurofleetx.enums.VehicleStatus;
import com.neurofleetx.enums.VehicleType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDTO {
    private Long id;
    private String name;
    private String model;
    private String color;
    private String licensePlate;
    private VehicleType vehicleType;
    private Integer seats;
    private FuelType fuelType;
    private VehicleStatus status;
    private Double latitude;
    private Double longitude;
    private Long driverId;
    private String driverName;
    private Double speed;
}