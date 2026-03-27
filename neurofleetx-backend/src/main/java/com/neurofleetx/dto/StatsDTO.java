// backend/src/main/java/com/neurofleetx/dto/StatsDTO.java
package com.neurofleetx.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsDTO {
    private Long total;
    private Long available;
    private Long inUse;
    private Long maintenance;
    private Long outOfService;
    private Long drivers;
    private Long managers;
    private Long customers;
    private Long totalTrips;
    private Double totalRevenue;
    private Double totalDistance;
    private Double avgDuration;
    private Long active;
    private List<Map<String, Object>> chartData;
    private List<Map<String, Object>> revenueData;
}