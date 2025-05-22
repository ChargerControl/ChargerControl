package chargercontrol.userapi.service;

import chargercontrol.userapi.model.BookSlot;
import chargercontrol.userapi.model.BookingStatus;
import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.BookSlotRepository;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookSlotService {

    private final BookSlotRepository bookSlotRepository;
    private final UserRepository userRepository;
    private final ChargingPortRepository chargingPortRepository;

    public BookSlotService(BookSlotRepository bookSlotRepository, UserRepository userRepository,
            ChargingPortRepository chargingPortRepository) {
        this.bookSlotRepository = bookSlotRepository;
        this.userRepository = userRepository;
        this.chargingPortRepository = chargingPortRepository;
    }

    @Transactional
    public BookSlot createBooking(BookSlot bookSlot) {
        User user = userRepository.findById(bookSlot.getUser().getId())
                .orElseThrow(
                        () -> new EntityNotFoundException("User not found with id: " + bookSlot.getUser().getId()));
        ChargingPort chargingPort = chargingPortRepository.findById(bookSlot.getChargingPort().getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "ChargingPort not found with id: " + bookSlot.getChargingPort().getId()));

        bookSlot.setUser(user);
        bookSlot.setChargingPort(chargingPort);

        // Check for overlapping bookings for the same charging port and time
        LocalDateTime bookingEndTime = bookSlot.getBookingTime().plusMinutes(bookSlot.getDuration());
        List<BookSlot> overlappingBookings = bookSlotRepository.findOverlappingBookings(
                chargingPort.getId(),
                bookSlot.getBookingTime(),
                bookingEndTime);

        if (!overlappingBookings.isEmpty()) {
            throw new RuntimeException("Booking slot is not available at the selected time for this charging port.");
        }
        // Set default status if not provided
        if (bookSlot.getStatus() == null) {
            bookSlot.setStatus(BookingStatus.PENDING);
        }
        return bookSlotRepository.save(bookSlot);
    }

    public Optional<BookSlot> getBookingById(Long id) {
        return bookSlotRepository.findById(id);
    }

    public List<BookSlot> getBookingsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        return bookSlotRepository.findByUser(user);
    }

    // Method to get bookings by a specific charging port ID
    public List<BookSlot> getBookingsByChargingPortId(Long chargingPortId) {
        ChargingPort chargingPort = chargingPortRepository.findById(chargingPortId)
                .orElseThrow(() -> new EntityNotFoundException("ChargingPort not found with id: " + chargingPortId));
        return bookSlotRepository.findByChargingPort(chargingPort);
    }

    // Method to get bookings by charging port and time range
    public List<BookSlot> getBookingsByChargingPortIdAndTimeRange(Long chargingPortId, LocalDateTime startTime,
            LocalDateTime endTime) {
        ChargingPort chargingPort = chargingPortRepository.findById(chargingPortId)
                .orElseThrow(() -> new EntityNotFoundException("ChargingPort not found with id: " + chargingPortId));
        return bookSlotRepository.findByChargingPortAndBookingTimeBetween(chargingPort, startTime, endTime);
    }

    @Transactional
    public BookSlot updateBookingStatus(Long id, BookingStatus status) {
        BookSlot booking = bookSlotRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot update status of a cancelled booking.");
        }
        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new RuntimeException("Cannot update status of an expired booking.");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot update status of an expired booking.");
        }

        if (booking.getStatus() == BookingStatus.ACTIVE && status != BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot update status of an active booking to anything other than completed.");
        }

        if (booking.getStatus() == BookingStatus.ACTIVE && status == BookingStatus.COMPLETED) {
            booking.getChargingPort().setEnergyUsed(
                    booking.getChargingPort().getEnergyUsed() + booking.getDuration() * (7.0 / 60));
        }
        booking.setStatus(status);
        return bookSlotRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(Long id) {
        BookSlot booking = bookSlotRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));
        // Add logic, e.g., can only cancel if status is 'PENDING' and
        // before booking time
        if (booking.getStatus() == BookingStatus.PENDING) {
            if (LocalDateTime.now().isBefore(booking.getBookingTime())) {
                booking.setStatus(BookingStatus.CANCELLED);
                bookSlotRepository.save(booking);
            } else {
                throw new RuntimeException("Cannot cancel booking: Booking time has already passed.");
            }
        } else {
            throw new RuntimeException(
                    "Cannot cancel booking: Booking is not in a cancellable state (e.g., already active, completed, or cancelled).");
        }
    }
}
