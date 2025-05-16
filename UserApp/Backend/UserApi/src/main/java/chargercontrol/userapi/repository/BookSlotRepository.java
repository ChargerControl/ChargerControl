package chargercontrol.userapi.repository;

import chargercontrol.userapi.model.BookSlot;
import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookSlotRepository extends JpaRepository<BookSlot, Long> {
    List<BookSlot> findByUser(User user);

    List<BookSlot> findByChargingPort(ChargingPort chargingPort); // Changed from findByStation

    List<BookSlot> findByBookingTimeBetween(LocalDateTime start, LocalDateTime end);

    List<BookSlot> findByChargingPortAndBookingTimeBetween(ChargingPort chargingPort, LocalDateTime start,
            LocalDateTime end);

    /**
     * Finds bookings that overlap with a given time range for a specific charging
     * port.
     * An overlap occurs if an existing booking starts before the new booking ends,
     * AND the existing booking ends after the new booking starts.
     * This does not include bookings that merely touch (e.g., one ends exactly when
     * another begins).
     * To include touching bookings, use <= and >= for times.
     */
    @Query("SELECT b FROM BookSlot b WHERE b.chargingPort.id = :chargingPortId " +
            "AND b.status <> chargercontrol.userapi.model.BookingStatus.CANCELLED " +
            "AND b.status <> chargercontrol.userapi.model.BookingStatus.EXPIRED " +
            "AND b.bookingTime < :endTime " +
            "AND FUNCTION('ADDTIME', b.bookingTime, FUNCTION('SEC_TO_TIME', b.duration * 60)) > :startTime")
    List<BookSlot> findOverlappingBookings(@Param("chargingPortId") Long chargingPortId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
