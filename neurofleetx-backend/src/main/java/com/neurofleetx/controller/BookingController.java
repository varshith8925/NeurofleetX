// backend/src/main/java/com/neurofleetx/controller/BookingController.java
package com.neurofleetx.controller;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.BookingDTO;
import com.neurofleetx.dto.StatsDTO;
import com.neurofleetx.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingService bookingService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDTO>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<BookingDTO>> createBooking(@RequestBody BookingDTO bookingDTO) {
        return ResponseEntity.ok(bookingService.createBooking(bookingDTO));
    }
    
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }
    
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getPendingBookings() {
        return ResponseEntity.ok(bookingService.getPendingBookings());
    }
    
    @GetMapping("/driver")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getDriverBookings() {
        return ResponseEntity.ok(bookingService.getDriverBookings());
    }
    
    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<BookingDTO>> acceptBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.acceptBooking(id));
    }
    
    @PutMapping("/{id}/start")
    public ResponseEntity<ApiResponse<BookingDTO>> startRide(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.startRide(id));
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BookingDTO>> completeRide(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.completeRide(id));
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDTO>> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatsDTO>> getBookingStats() {
        return ResponseEntity.ok(bookingService.getBookingStats());
    }
    
    @GetMapping("/driver/earnings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDriverEarnings() {
        return ResponseEntity.ok(bookingService.getDriverEarnings());
    }
    
    @GetMapping("/customer/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCustomerStats() {
        return ResponseEntity.ok(bookingService.getCustomerStats());
    }
}