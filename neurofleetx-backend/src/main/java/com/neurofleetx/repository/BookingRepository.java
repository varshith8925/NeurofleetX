// backend/src/main/java/com/neurofleetx/repository/BookingRepository.java
package com.neurofleetx.repository;

import com.neurofleetx.entity.Booking;
import com.neurofleetx.entity.User;
import com.neurofleetx.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerOrderByBookingDateDesc(User customer);
    List<Booking> findByDriverOrderByBookingDateDesc(User driver);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByStatusIn(List<BookingStatus> statuses);
    long countByStatus(BookingStatus status);
    
    @Query("SELECT SUM(b.fare) FROM Booking b WHERE b.status = 'COMPLETED'")
    Double getTotalRevenue();
    
    @Query("SELECT SUM(b.distance) FROM Booking b WHERE b.status = 'COMPLETED'")
    Double getTotalDistance();
    
    @Query("SELECT SUM(b.fare) FROM Booking b WHERE b.driver = :driver AND b.status = 'COMPLETED'")
    Double getDriverTotalEarnings(User driver);
    
    @Query("SELECT SUM(b.fare) FROM Booking b WHERE b.customer = :customer AND b.status = 'COMPLETED'")
    Double getCustomerTotalSpent(User customer);
    
    @Query("SELECT SUM(b.distance) FROM Booking b WHERE b.customer = :customer AND b.status = 'COMPLETED'")
    Double getCustomerTotalDistance(User customer);
    
    long countByCustomerAndStatus(User customer, BookingStatus status);
    long countByDriverAndStatus(User driver, BookingStatus status);
}