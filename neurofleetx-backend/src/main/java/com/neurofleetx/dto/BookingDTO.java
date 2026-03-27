// backend/src/main/java/com/neurofleetx/dto/BookingDTO.java
package com.neurofleetx.dto;

import com.neurofleetx.enums.BookingStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long vehicleId;
    private String vehicleName;
    private String vehicleLicensePlate;
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String pickupLocation;
    private String dropoffLocation;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    private Double distance;
    private Integer estimatedDuration;
    private Double fare;
    private BookingStatus status;
    private LocalDateTime bookingDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime completedAt;
}