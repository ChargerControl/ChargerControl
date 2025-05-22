package chargercontrol.userapi.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import chargercontrol.userapi.model.BookSlot;
import chargercontrol.userapi.model.BookingStatus;
import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.BookSlotRepository;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class BookSlotServiceTest {

    @Mock
    private BookSlotRepository bookSlotRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ChargingPortRepository chargingPortRepository;

    @InjectMocks
    private BookSlotService bookSlotService;

    private User testUser;
    private Car testCar;
    private Station testStation;
    private ChargingPort testPort;
    private BookSlot testBookSlot;

    @BeforeEach
    void setUp() {
        // Initialize test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");

        // Initialize test car
        testCar = new Car();
        testCar.setId(1L);
        testCar.setModel("Tesla Model 3");
        testCar.setMaximumCharge(75.0);

        // Initialize test station
        testStation = new Station();
        testStation.setId(1L);
        testStation.setName("Test Station");

        // Initialize test charging port
        testPort = new ChargingPort();
        testPort.setId(1L);
        testPort.setStation(testStation);
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);

        // Initialize test booking
        testBookSlot = new BookSlot();
        testBookSlot.setId(1L);
        testBookSlot.setUser(testUser);
        testBookSlot.setCar(testCar);
        testBookSlot.setChargingPort(testPort);
        testBookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        testBookSlot.setDuration(60);
        testBookSlot.setStatus(BookingStatus.PENDING);
    }

    @Test
    void createBooking_Success() {
        // Arrange
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(bookSlotRepository.findOverlappingBookings(any(), any(), any())).thenReturn(Collections.emptyList());
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        BookSlot result = bookSlotService.createBooking(testBookSlot);

        // Assert
        assertNotNull(result);
        assertEquals(testBookSlot.getId(), result.getId());
        assertEquals(BookingStatus.PENDING, result.getStatus());
        verify(bookSlotRepository).save(any(BookSlot.class));
    }

    @Test
    void createBooking_OverlappingBookings_ThrowsException() {
        // Arrange
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(bookSlotRepository.findOverlappingBookings(any(), any(), any()))
                .thenReturn(Arrays.asList(new BookSlot()));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> bookSlotService.createBooking(testBookSlot));
    }

    @Test
    void createBooking_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> bookSlotService.createBooking(testBookSlot));
    }

    @Test
    void createBooking_ChargingPortNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> bookSlotService.createBooking(testBookSlot));
    }

    @Test
    void createBooking_WithNullStatus_SetsPendingStatus() {
        // Arrange
        testBookSlot.setStatus(null);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(bookSlotRepository.findOverlappingBookings(any(), any(), any())).thenReturn(Collections.emptyList());
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        BookSlot result = bookSlotService.createBooking(testBookSlot);

        // Assert
        assertEquals(BookingStatus.PENDING, result.getStatus());
    }

    @Test
    void createBooking_WithExistingStatus_MaintainsStatus() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.ACTIVE);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(bookSlotRepository.findOverlappingBookings(any(), any(), any())).thenReturn(Collections.emptyList());
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        BookSlot result = bookSlotService.createBooking(testBookSlot);

        // Assert
        assertEquals(BookingStatus.ACTIVE, result.getStatus());
    }

    @Test
    void getBookingById_Success() {
        // Arrange
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act
        Optional<BookSlot> result = bookSlotService.getBookingById(testBookSlot.getId());

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testBookSlot.getId(), result.get().getId());
    }

    @Test
    void getBookingsByUserId_Success() {
        // Arrange
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(bookSlotRepository.findByUser(testUser)).thenReturn(Arrays.asList(testBookSlot));

        // Act
        List<BookSlot> result = bookSlotService.getBookingsByUserId(testUser.getId());

        // Assert
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testBookSlot.getId(), result.get(0).getId());
    }

    @Test
    void updateBookingStatus_Success() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.PENDING);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        BookSlot result = bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.ACTIVE);

        // Assert
        assertNotNull(result);
        assertEquals(BookingStatus.ACTIVE, result.getStatus());
    }

    @Test
    void updateBookingStatus_FromPendingToActive_Success() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.PENDING);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        BookSlot result = bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.ACTIVE);

        // Assert
        assertEquals(BookingStatus.ACTIVE, result.getStatus());
    }

    @Test
    void updateBookingStatus_FromPendingToCompleted_Success() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.PENDING);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        BookSlot result = bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.COMPLETED);

        // Assert
        assertEquals(BookingStatus.COMPLETED, result.getStatus());
    }

    @Test
    void updateBookingStatus_FromActiveToCompleted_CalculatesEnergyUsed() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.ACTIVE);
        testBookSlot.setDuration(60); // 1 hour
        double initialEnergyUsed = testPort.getEnergyUsed();
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        BookSlot result = bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.COMPLETED);

        // Assert
        assertEquals(BookingStatus.COMPLETED, result.getStatus());
        assertEquals(initialEnergyUsed + 7.0, result.getChargingPort().getEnergyUsed());
    }

    @Test
    void updateBookingStatus_FromActiveToOtherThanCompleted_ThrowsException() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.ACTIVE);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.PENDING));
    }

    @Test
    void updateBookingStatus_FromExpiredStatus_ThrowsException() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.EXPIRED);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.ACTIVE));
    }

    @Test
    void updateBookingStatus_FromCancelledStatus_ThrowsException() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.CANCELLED);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.ACTIVE));
    }

    @Test
    void updateBookingStatus_FromCompletedStatus_ThrowsException() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.COMPLETED);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.ACTIVE));
    }

    @Test
    void updateBookingStatus_BookingNotFound_ThrowsException() {
        // Arrange
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class,
            () -> bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.ACTIVE));
    }

    @Test
    void updateBookingStatus_CancelledBooking_ThrowsException() {
        // Arrange
        testBookSlot.setStatus(BookingStatus.CANCELLED);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> bookSlotService.updateBookingStatus(testBookSlot.getId(), BookingStatus.ACTIVE));
    }

    @Test
    void cancelBooking_Success() {
        // Arrange
        testBookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        testBookSlot.setStatus(BookingStatus.PENDING);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));
        when(bookSlotRepository.save(any(BookSlot.class))).thenReturn(testBookSlot);

        // Act
        assertDoesNotThrow(() -> bookSlotService.cancelBooking(testBookSlot.getId()));

        // Assert
        verify(bookSlotRepository).save(any(BookSlot.class));
    }

    @Test
    void cancelBooking_PastBookingTime_ThrowsException() {
        // Arrange
        testBookSlot.setBookingTime(LocalDateTime.now().minusHours(1));
        testBookSlot.setStatus(BookingStatus.PENDING);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> bookSlotService.cancelBooking(testBookSlot.getId()));
    }

    @Test
    void cancelBooking_NonPendingStatus_ThrowsException() {
        // Arrange
        testBookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        testBookSlot.setStatus(BookingStatus.ACTIVE);
        when(bookSlotRepository.findById(testBookSlot.getId())).thenReturn(Optional.of(testBookSlot));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> bookSlotService.cancelBooking(testBookSlot.getId()));
    }

    @Test
    void getBookingsByChargingPortId_Success() {
        // Arrange
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(bookSlotRepository.findByChargingPort(testPort)).thenReturn(Arrays.asList(testBookSlot));

        // Act
        List<BookSlot> result = bookSlotService.getBookingsByChargingPortId(testPort.getId());

        // Assert
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testBookSlot.getId(), result.get(0).getId());
    }

    @Test
    void getBookingsByChargingPortIdAndTimeRange_Success() {
        // Arrange
        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = startTime.plusHours(2);
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(bookSlotRepository.findByChargingPortAndBookingTimeBetween(testPort, startTime, endTime))
                .thenReturn(Arrays.asList(testBookSlot));

        // Act
        List<BookSlot> result = bookSlotService.getBookingsByChargingPortIdAndTimeRange(testPort.getId(), startTime,
                endTime);

        // Assert
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testBookSlot.getId(), result.get(0).getId());
    }
}
