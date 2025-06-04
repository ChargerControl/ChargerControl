package chargercontrol.userapi.service;

import chargercontrol.userapi.model.*;
import chargercontrol.userapi.repository.BookSlotRepository;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private StationService stationService;

    public BookSlotService(BookSlotRepository bookSlotRepository, UserRepository userRepository,
            ChargingPortRepository chargingPortRepository) {
        this.bookSlotRepository = bookSlotRepository;
        this.userRepository = userRepository;
        this.chargingPortRepository = chargingPortRepository;
    }

    @Transactional
    public BookSlot createBookingWithValidation(BookRequest bookRequest) {
        // Get user directly by userId
        User user = userService.getUserById(bookRequest.getUserId());
        if (user == null) {
            throw new RuntimeException("User not found with id: " + bookRequest.getUserId());
        }

        // Get station with charging ports (this should handle lazy loading properly)
        Station station = stationService.getStationWithChargingPorts(bookRequest.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + bookRequest.getStationId()));

        // Find an available slot in any of the charging ports
        ChargingPort availablePort = station.getChargingPorts().stream()
                .filter(port -> port.getStatus() == ChargingPortStatus.AVAILABLE)
                .filter(port -> isSlotAvailable(port, bookRequest.getStartTime(), bookRequest.getDuration()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No available slots at this station for the requested time"));

        // Get the car from the user's cars
        Car car = user.getCars().stream()
                .filter(c -> c.getId().equals(bookRequest.getCarId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Car not found with id: " + bookRequest.getCarId()));

        // Create the booking object
        BookSlot bookSlot = new BookSlot();
        bookSlot.setUser(user);
        bookSlot.setChargingPort(availablePort);
        bookSlot.setCar(car);
        bookSlot.setBookingTime(bookRequest.getStartTime());
        bookSlot.setDuration(bookRequest.getDuration());
        bookSlot.setStatus(BookingStatus.PENDING);

        // Save and return the booking
        return createBooking(bookSlot);
    }

    // Helper method to check if a slot is available
    private boolean isSlotAvailable(ChargingPort port, LocalDateTime startTime, Integer duration) {
        LocalDateTime endTime = startTime.plusMinutes(duration);
        List<BookSlot> overlappingBookings = getBookingsByChargingPortIdAndTimeRange(
                port.getId(), startTime, endTime);
        return overlappingBookings.isEmpty();
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