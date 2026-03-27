// backend/src/main/java/com/neurofleetx/dto/AlertDTO.java
package com.neurofleetx.dto;

import com.neurofleetx.enums.AlertType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDTO {
    private Long id;
    private Long vehicleId;
    private String vehicleName;
    private AlertType type;
    private String message;
    private Boolean acknowledged;
    private LocalDateTime timestamp;
}