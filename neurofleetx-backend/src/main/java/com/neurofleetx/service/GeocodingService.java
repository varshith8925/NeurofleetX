package com.neurofleetx.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> searchLocation(String locationName) {
        try {
            // Using Nominatim (OpenStreetMap) API - Free, no API key needed
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", locationName)
                    .queryParam("format", "json")
                    .queryParam("limit", "5")
                    .toUriString();

            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);

            return result;

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to search location: " + e.getMessage());
            return error;
        }
    }

    public Map<String, Double> getCoordinates(String locationName) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", locationName)
                    .queryParam("format", "json")
                    .queryParam("limit", "1")
                    .toUriString();

            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            if (response != null && !response.isEmpty()) {
                Map<String, Object> location = response.get(0);
                Map<String, Double> coordinates = new HashMap<>();
                coordinates.put("lat", Double.parseDouble(location.get("lat").toString()));
                coordinates.put("lng", Double.parseDouble(location.get("lon").toString()));
                return coordinates;
            }

            return null;

        } catch (Exception e) {
            return null;
        }
    }
}