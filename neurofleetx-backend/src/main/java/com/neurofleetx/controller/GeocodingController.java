package com.neurofleetx.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.neurofleetx.service.GeocodingService;

import java.util.Map;

@RestController
@RequestMapping("/api/geocoding")
@RequiredArgsConstructor
public class GeocodingController {

    private final GeocodingService geocodingService;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchLocation(@RequestParam String query) {
        return ResponseEntity.ok(geocodingService.searchLocation(query));
    }

    @GetMapping("/coordinates")
    public ResponseEntity<Map<String, Double>> getCoordinates(@RequestParam String location) {
        Map<String, Double> coords = geocodingService.getCoordinates(location);
        if (coords != null) {
            return ResponseEntity.ok(coords);
        }
        return ResponseEntity.notFound().build();
    }
}