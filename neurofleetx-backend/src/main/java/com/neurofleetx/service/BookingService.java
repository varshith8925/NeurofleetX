// backend/src/main/java/com/neurofleetx/service/BookingService.java
package com.neurofleetx.service;

import com.neurofleetx.dto.ApiResponse;
import com.neurofleetx.dto.BookingDTO;
import com.neurofleetx.dto.StatsDTO;
import com.neurofleetx.entity.Booking;
import com.neurofleetx.entity.User;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.enums.BookingStatus;
import com.neurofleetx.enums.VehicleStatus;
import com.neurofleetx.repository.BookingRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import com.neurofleetx.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
    
    public ApiResponse<List<BookingDTO>> getAllBookings() {
        List<BookingDTO> bookings = bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(bookings);
    }
    
    public ApiResponse<BookingDTO> getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ApiResponse.error("Booking not found");
        }
        return ApiResponse.success(mapToDTO(booking));
    }
    
    public ApiResponse<BookingDTO> createBooking(BookingDTO bookingDTO) {
        User customer = getCurrentUser();
        
        Vehicle vehicle = vehicleRepository.findById(bookingDTO.getVehicleId()).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }
        
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            return ApiResponse.error("Vehicle is not available");
        }
        
        Booking booking = Booking.builder()
                .customer(customer)
                .vehicle(vehicle)
                .pickupLocation(bookingDTO.getPickupLocation())
                .dropoffLocation(bookingDTO.getDropoffLocation())
                .pickupLat(bookingDTO.getPickupLat())
                .pickupLng(bookingDTO.getPickupLng())
                .dropoffLat(bookingDTO.getDropoffLat())
                .dropoffLng(bookingDTO.getDropoffLng())
                .distance(bookingDTO.getDistance())
                .estimatedDuration(bookingDTO.getEstimatedDuration())
                .fare(bookingDTO.getFare())
                .status(BookingStatus.PENDING)
                .bookingDate(LocalDateTime.now())
                .build();
        
        bookingRepository.save(booking);
        return ApiResponse.success(mapToDTO(booking));
    }
    
    public ApiResponse<List<BookingDTO>> getMyBookings() {
        User customer = getCurrentUser();
        List<BookingDTO> bookings = bookingRepository.findByCustomerOrderByBookingDateDesc(customer).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(bookings);
    }
    
    public ApiResponse<List<BookingDTO>> getPendingBookings() {
        List<BookingDTO> bookings = bookingRepository.findByStatus(BookingStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(bookings);
    }
    
    public ApiResponse<List<BookingDTO>> getDriverBookings() {
        User driver = getCurrentUser();
        List<BookingDTO> bookings = bookingRepository.findByDriverOrderByBookingDateDesc(driver).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(bookings);
    }
    
    public ApiResponse<BookingDTO> acceptBooking(Long id) {
        User driver = getCurrentUser();
        Booking booking = bookingRepository.findById(id).orElse(null);
        
        if (booking == null) {
            return ApiResponse.error("Booking not found");
        }
        
        booking.setDriver(driver);
        booking.setStatus(BookingStatus.ACCEPTED);
        
        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.IN_USE);
        vehicle.setDriver(driver);
        
        driver.setAvailable(false);
        
        vehicleRepository.save(vehicle);
        userRepository.save(driver);
        bookingRepository.save(booking);
        
        return ApiResponse.success(mapToDTO(booking));
    }
    
    public ApiResponse<BookingDTO> startRide(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ApiResponse.error("Booking not found");
        }
        
        booking.setStatus(BookingStatus.IN_PROGRESS);
        booking.setStartTime(LocalDateTime.now());
        bookingRepository.save(booking);
        
        return ApiResponse.success(mapToDTO(booking));
    }
    
    public ApiResponse<BookingDTO> completeRide(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ApiResponse.error("Booking not found");
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setEndTime(LocalDateTime.now());
        
        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        
        User driver = booking.getDriver();
        if (driver != null) {
            driver.setAvailable(true);
            userRepository.save(driver);
        }
        
        vehicleRepository.save(vehicle);
        bookingRepository.save(booking);
        
        return ApiResponse.success(mapToDTO(booking));
    }
    
    public ApiResponse<BookingDTO> cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ApiResponse.error("Booking not found");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        
        if (booking.getVehicle() != null) {
            Vehicle vehicle = booking.getVehicle();
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(vehicle);
        }
        
        if (booking.getDriver() != null) {
            User driver = booking.getDriver();
            driver.setAvailable(true);
            userRepository.save(driver);
        }
        
        bookingRepository.save(booking);
        return ApiResponse.success(mapToDTO(booking));
    }
    
    public ApiResponse<StatsDTO> getBookingStats() {
        Double totalRevenue = bookingRepository.getTotalRevenue();
        Double totalDistance = bookingRepository.getTotalDistance();
        
        StatsDTO stats = StatsDTO.builder()
                .totalTrips(bookingRepository.countByStatus(BookingStatus.COMPLETED))
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .totalDistance(totalDistance != null ? totalDistance : 0.0)
                .active(bookingRepository.countByStatus(BookingStatus.IN_PROGRESS))
                .chartData(generateChartData())
                .revenueData(generateRevenueData())
                .build();
        
        return ApiResponse.success(stats);
    }
    
    public ApiResponse<Map<String, Object>> getDriverEarnings() {
        User driver = getCurrentUser();
        
        Double totalEarnings = bookingRepository.getDriverTotalEarnings(driver);
        long completedTrips = bookingRepository.countByDriverAndStatus(driver, BookingStatus.COMPLETED);
        
        // Get assigned vehicle
        Vehicle assignedVehicle = vehicleRepository.findAll().stream()
                .filter(v -> v.getDriver() != null && v.getDriver().getId().equals(driver.getId()))
                .findFirst().orElse(null);
        
        // Get active ride
        Booking activeRide = bookingRepository.findByDriverOrderByBookingDateDesc(driver).stream()
                .filter(b -> b.getStatus() == BookingStatus.ACCEPTED || b.getStatus() == BookingStatus.IN_PROGRESS)
                .findFirst().orElse(null);
        
        Map<String, Object> earnings = new HashMap<>();
        earnings.put("totalEarnings", totalEarnings != null ? totalEarnings : 0.0);
        earnings.put("completedTrips", completedTrips);
        earnings.put("todayEarnings", 0.0); // Would need date-based query
        earnings.put("weeklyEarnings", 0.0);
        earnings.put("chartData", generateChartData());
        
        if (assignedVehicle != null) {
            Map<String, Object> vehicleMap = new HashMap<>();
            vehicleMap.put("id", assignedVehicle.getId());
            vehicleMap.put("name", assignedVehicle.getName());
            vehicleMap.put("model", assignedVehicle.getModel());
            vehicleMap.put("licensePlate", assignedVehicle.getLicensePlate());
            earnings.put("assignedVehicle", vehicleMap);
        }
        
        if (activeRide != null) {
            earnings.put("activeRide", mapToDTO(activeRide));
        }
        
        return ApiResponse.success(earnings);
    }
    
    public ApiResponse<Map<String, Object>> getCustomerStats() {
        User customer = getCurrentUser();
        
        Double totalSpent = bookingRepository.getCustomerTotalSpent(customer);
        Double totalDistance = bookingRepository.getCustomerTotalDistance(customer);
        long totalTrips = bookingRepository.countByCustomerAndStatus(customer, BookingStatus.COMPLETED);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTrips", totalTrips);
        stats.put("totalSpent", totalSpent != null ? totalSpent : 0.0);
        stats.put("totalDistance", totalDistance != null ? totalDistance : 0.0);
        stats.put("totalTime", 0); // Would need duration calculation
        
        return ApiResponse.success(stats);
    }
    
    private List<Map<String, Object>> generateChartData() {
        List<Map<String, Object>> data = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        Random random = new Random();
        
        for (String day : days) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", day);
            entry.put("trips", random.nextInt(20) + 5);
            entry.put("distance", random.nextInt(200) + 50);
            entry.put("earnings", random.nextInt(5000) + 1000);
            data.add(entry);
        }
        
        return data;
    }
    
    private List<Map<String, Object>> generateRevenueData() {
        return generateChartData();
    }
    
    private BookingDTO mapToDTO(Booking booking) {
        BookingDTO dto = BookingDTO.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getName())
                .vehicleId(booking.getVehicle().getId())
                .vehicleName(booking.getVehicle().getName())
                .vehicleLicensePlate(booking.getVehicle().getLicensePlate())
                .pickupLocation(booking.getPickupLocation())
                .dropoffLocation(booking.getDropoffLocation())
                .pickupLat(booking.getPickupLat())
                .pickupLng(booking.getPickupLng())
                .dropoffLat(booking.getDropoffLat())
                .dropoffLng(booking.getDropoffLng())
                .distance(booking.getDistance())
                .estimatedDuration(booking.getEstimatedDuration())
                .fare(booking.getFare())
                .status(booking.getStatus())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .completedAt(booking.getEndTime())
                .build();
        
        if (booking.getDriver() != null) {
            dto.setDriverId(booking.getDriver().getId());
            dto.setDriverName(booking.getDriver().getName());
            dto.setDriverPhone(booking.getDriver().getPhone());
        }
        
        return dto;
    }
}