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
import java.util.stream.Collectors;

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

    // SOLUÇÃO: Adicionar @Transactional(readOnly = true) para manter a sessão ativa
    @Transactional(readOnly = true)
    public Optional<BookSlot> getBookingById(Long id) {
        Optional<BookSlot> bookingOpt = bookSlotRepository.findById(id);
        
        if (bookingOpt.isPresent()) {
            BookSlot booking = bookingOpt.get();
            // Forçar o carregamento dos objetos lazy para evitar LazyInitializationException
            booking.getUser().getName(); // Trigger lazy loading
            booking.getChargingPort().getId(); // Trigger lazy loading
            booking.getCar().getModel(); // Trigger lazy loading
        }
        
        return bookingOpt;
    }

    // Também aplicar @Transactional(readOnly = true) nos outros métodos de consulta
    @Transactional(readOnly = true)
    public List<BookSlot> getBookingsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        List<BookSlot> bookings = bookSlotRepository.findByUser(user);
        
        // Forçar carregamento lazy para todos os bookings
        bookings.forEach(booking -> {
            booking.getUser().getName();
            booking.getChargingPort().getId();
            booking.getCar().getModel();
        });
        
        return bookings;
    }

    @Transactional(readOnly = true)
    public List<BookSlot> getBookingsByChargingPortId(Long chargingPortId) {
        ChargingPort chargingPort = chargingPortRepository.findById(chargingPortId)
                .orElseThrow(() -> new EntityNotFoundException("ChargingPort not found with id: " + chargingPortId));
        
        List<BookSlot> bookings = bookSlotRepository.findByChargingPort(chargingPort);
        
        // Forçar carregamento lazy
        bookings.forEach(booking -> {
            booking.getUser().getName();
            booking.getChargingPort().getId();
            booking.getCar().getModel();
        });
        
        return bookings;
    }

    @Transactional(readOnly = true)
    public List<BookSlot> getBookingsByChargingPortIdAndTimeRange(Long chargingPortId, LocalDateTime startTime,
            LocalDateTime endTime) {
        ChargingPort chargingPort = chargingPortRepository.findById(chargingPortId)
                .orElseThrow(() -> new EntityNotFoundException("ChargingPort not found with id: " + chargingPortId));
        
        List<BookSlot> bookings = bookSlotRepository.findByChargingPortAndBookingTimeBetween(chargingPort, startTime, endTime);
        
        // Forçar carregamento lazy
        bookings.forEach(booking -> {
            booking.getUser().getName();
            booking.getChargingPort().getId();
            booking.getCar().getModel();
        });
        
        return bookings;
    }

    // Resto dos métodos permanecem iguais...
    
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

        // Debug: Log station and ports info
        System.out.println("=== BOOKING DEBUG ===");
        System.out.println("Station ID: " + station.getId());
        System.out.println("Total charging ports: " + station.getChargingPorts().size());
        
        // Get the car from the user's cars
        Car car = user.getCars().stream()
                .filter(c -> c.getId().equals(bookRequest.getCarId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Car not found with id: " + bookRequest.getCarId()));

        // Find an available slot in any of the charging ports
        ChargingPort availablePort = null;
        
        for (ChargingPort port : station.getChargingPorts()) {
            System.out.println("Checking port ID: " + port.getId() + ", Status: " + port.getStatus());
            
            if (port.getStatus() == ChargingPortStatus.AVAILABLE) {
                System.out.println("Port " + port.getId() + " is AVAILABLE, checking time slots...");
                
                if (isSlotAvailable(port, bookRequest.getStartTime(), bookRequest.getDuration())) {
                    System.out.println("Port " + port.getId() + " has available slot!");
                    availablePort = port;
                    break;
                } else {
                    System.out.println("Port " + port.getId() + " slot is not available");
                }
            } else {
                System.out.println("Port " + port.getId() + " is not AVAILABLE (status: " + port.getStatus() + ")");
            }
        }
        
        if (availablePort == null) {
            // Provide detailed error message
            long availablePorts = station.getChargingPorts().stream()
                    .filter(port -> port.getStatus() == ChargingPortStatus.AVAILABLE)
                    .count();
            
            throw new RuntimeException("No available slots at this station for the requested time. " +
                    "Station has " + station.getChargingPorts().size() + " total ports, " +
                    availablePorts + " are available. " +
                    "Requested time: " + bookRequest.getStartTime() + 
                    " for " + bookRequest.getDuration() + " minutes");
        }

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

    // MÉTODO CORRIGIDO - Verifica se um slot está disponível
    private boolean isSlotAvailable(ChargingPort port, LocalDateTime startTime, Integer duration) {
        LocalDateTime endTime = startTime.plusMinutes(duration);
        
        System.out.println("Checking slot availability for port " + port.getId());
        System.out.println("Requested time: " + startTime + " to " + endTime);
        
        // Buscar TODAS as reservas ativas da porta (não canceladas nem expiradas)
        List<BookSlot> activeBookings = bookSlotRepository.findByChargingPort(port)
                .stream()
                .filter(booking -> booking.getStatus() != BookingStatus.CANCELLED)
                .filter(booking -> booking.getStatus() != BookingStatus.EXPIRED)
                .collect(Collectors.toList());
        
        System.out.println("Found " + activeBookings.size() + " active bookings for this port");
        
        // Verificar se alguma reserva ativa sobrepõe com o período solicitado
        for (BookSlot booking : activeBookings) {
            LocalDateTime bookingStart = booking.getBookingTime();
            LocalDateTime bookingEnd = bookingStart.plusMinutes(booking.getDuration());
            
            System.out.println("Existing booking: " + bookingStart + " to " + bookingEnd + " (Status: " + booking.getStatus() + ")");
            
            // Verificar sobreposição: duas reservas se sobrepõem se:
            // - Nova reserva não termina antes da existente começar E
            // - Nova reserva não começa depois da existente terminar
            boolean overlaps = !(endTime.isBefore(bookingStart) || endTime.equals(bookingStart) || 
                               startTime.isAfter(bookingEnd) || startTime.equals(bookingEnd));
            
            if (overlaps) {
                System.out.println("CONFLICT FOUND: Booking overlaps with existing reservation");
                return false; // Há conflito
            }
        }
        
        System.out.println("No conflicts found - slot is available");
        return true; // Nenhum conflito encontrado
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

    @Transactional
public BookSlot updateBookingStatus(Long id, BookingStatus newStatus) {
    BookSlot booking = bookSlotRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));
    
    BookingStatus currentStatus = booking.getStatus();
    
    // Log current state for debugging
    System.out.println("=== STATUS UPDATE DEBUG ===");
    System.out.println("Booking ID: " + id);
    System.out.println("Current Status: " + currentStatus);
    System.out.println("Requested New Status: " + newStatus);
    System.out.println("Booking Time: " + booking.getBookingTime());
    System.out.println("Current Time: " + LocalDateTime.now());
    
    // Validate status transitions
    validateStatusTransition(currentStatus, newStatus, booking);
    
    // Handle specific status changes
    if (newStatus == BookingStatus.ACTIVE) {
        // Check if booking time has arrived (allow some flexibility - 15 minutes early)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bookingTime = booking.getBookingTime();
        
        if (now.isBefore(bookingTime.minusMinutes(15))) {
            throw new RuntimeException("Cannot activate booking before scheduled time. Booking starts at: " + bookingTime);
        }
        
        // Update charging port status to OCCUPIED when booking becomes active
        ChargingPort port = booking.getChargingPort();
        if (port.getStatus() == ChargingPortStatus.AVAILABLE) {
            port.setStatus(ChargingPortStatus.OCCUPIED);
            chargingPortRepository.save(port);
        }
    }
    
    if (currentStatus == BookingStatus.ACTIVE && newStatus == BookingStatus.COMPLETED) {
        // Calculate energy used and update charging port
        ChargingPort port = booking.getChargingPort();
        double energyUsed = booking.getDuration() * (7.0 / 60); // 7kW rate
        port.setEnergyUsed(port.getEnergyUsed() + energyUsed);
        
        // Free up the charging port
        port.setStatus(ChargingPortStatus.AVAILABLE);
        chargingPortRepository.save(port);
    }
    
    if (newStatus == BookingStatus.CANCELLED) {
        // Free up the charging port if it was occupied by this booking
        ChargingPort port = booking.getChargingPort();
        if (port.getStatus() == ChargingPortStatus.OCCUPIED) {
            port.setStatus(ChargingPortStatus.AVAILABLE);
            chargingPortRepository.save(port);
        }
    }
    
    booking.setStatus(newStatus);
    BookSlot savedBooking = bookSlotRepository.save(booking);
    
    System.out.println("Status successfully updated to: " + savedBooking.getStatus());
    return savedBooking;
}

private void validateStatusTransition(BookingStatus currentStatus, BookingStatus newStatus, BookSlot booking) {
    // Cannot change status of cancelled bookings
    if (currentStatus == BookingStatus.CANCELLED) {
        throw new RuntimeException("Cannot update status of a cancelled booking.");
    }
    
    // Cannot change status of expired bookings
    if (currentStatus == BookingStatus.EXPIRED) {
        throw new RuntimeException("Cannot update status of an expired booking.");
    }
    
    // Cannot change status of completed bookings
    if (currentStatus == BookingStatus.COMPLETED) {
        throw new RuntimeException("Cannot update status of a completed booking.");
    }
    
    // From PENDING, can go to ACTIVE, CANCELLED, or EXPIRED
    if (currentStatus == BookingStatus.PENDING) {
        if (newStatus != BookingStatus.ACTIVE && 
            newStatus != BookingStatus.CANCELLED && 
            newStatus != BookingStatus.EXPIRED) {
            throw new RuntimeException("From PENDING status, can only transition to ACTIVE, CANCELLED, or EXPIRED.");
        }
    }
    
    // From ACTIVE, can only go to COMPLETED or CANCELLED
    if (currentStatus == BookingStatus.ACTIVE) {
        if (newStatus != BookingStatus.COMPLETED && newStatus != BookingStatus.CANCELLED) {
            throw new RuntimeException("From ACTIVE status, can only transition to COMPLETED or CANCELLED.");
        }
    }
    
    // Additional validation: cannot activate expired bookings
    if (newStatus == BookingStatus.ACTIVE) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bookingEndTime = booking.getBookingTime().plusMinutes(booking.getDuration());
        
        if (now.isAfter(bookingEndTime)) {
            throw new RuntimeException("Cannot activate booking: booking time has already passed.");
        }
    }
}

    @Transactional
    public void cancelBooking(Long id) {
        BookSlot booking = bookSlotRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));
        
        // Add logic, e.g., can only cancel if status is 'PENDING' and before booking time
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

    // Método adicional para limpeza de reservas expiradas
    @Transactional
    public void cleanupExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        
        List<BookSlot> expiredBookings = bookSlotRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING)
                .filter(booking -> booking.getBookingTime().plusMinutes(booking.getDuration()).isBefore(now))
                .collect(Collectors.toList());
        
        for (BookSlot booking : expiredBookings) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookSlotRepository.save(booking);
        }
        
        System.out.println("Cleaned up " + expiredBookings.size() + " expired bookings");
    }
}