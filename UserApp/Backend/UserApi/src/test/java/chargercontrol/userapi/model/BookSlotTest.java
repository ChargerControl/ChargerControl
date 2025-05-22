package chargercontrol.userapi.model;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class BookSlotTest {

    private static Validator validator;
    private BookSlot bookSlot;
    private User user;
    private Car car;
    private ChargingPort chargingPort;

    @BeforeAll
    static void setupValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @BeforeEach
    void setUp() {
        // Setup User
        user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");

        // Setup Car
        car = new Car();
        car.setId(1L);
        car.setModel("Tesla Model 3");
        car.setMaximumCharge(75.0);

        // Setup Station
        Station station = new Station();
        station.setId(1L);
        station.setName("Test Station");

        // Setup ChargingPort
        chargingPort = new ChargingPort();
        chargingPort.setId(1L);
        chargingPort.setStation(station);
        chargingPort.setStatus(ChargingPortStatus.AVAILABLE);
        chargingPort.setEnergyUsed(0.0);

        // Setup BookSlot with valid data
        bookSlot = new BookSlot();
        bookSlot.setId(1L);
        bookSlot.setUser(user);
        bookSlot.setCar(car);
        bookSlot.setChargingPort(chargingPort);
        bookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        bookSlot.setDuration(60);
        bookSlot.setStatus(BookingStatus.PENDING);
    }

    @Test
    void whenAllFieldsAreValid_thenNoValidationViolations() {
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);
        assertTrue(violations.isEmpty());
    }

    @Test
    void whenUserIsNull_thenValidationFails() {
        bookSlot.setUser(null);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("User cannot be null",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenChargingPortIsNull_thenValidationFails() {
        bookSlot.setChargingPort(null);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Charging port cannot be null",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenCarIsNull_thenValidationFails() {
        bookSlot.setCar(null);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Car cannot be null",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenBookingTimeIsNull_thenValidationFails() {
        bookSlot.setBookingTime(null);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Booking date and time cannot be null",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenBookingTimeIsInPast_thenValidationFails() {
        bookSlot.setBookingTime(LocalDateTime.now().minusHours(1));
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Booking date must be in the present or future",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenDurationIsNull_thenValidationFails() {
        bookSlot.setDuration(null);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Duration cannot be null",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenDurationIsZero_thenValidationFails() {
        bookSlot.setDuration(0);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Duration must be a positive value",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenDurationIsNegative_thenValidationFails() {
        bookSlot.setDuration(-60);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Duration must be a positive value",
            violations.iterator().next().getMessage());
    }

    @Test
    void whenStatusIsNull_thenValidationFails() {
        bookSlot.setStatus(null);
        Set<jakarta.validation.ConstraintViolation<BookSlot>> violations = validator.validate(bookSlot);

        assertFalse(violations.isEmpty());
        assertEquals("Booking status is required",
            violations.iterator().next().getMessage());
    }

    @Test
    void testAllArgsConstructor() {
        BookSlot newBookSlot = new BookSlot(1L, user, chargingPort, car,
            LocalDateTime.now().plusHours(1), 60, BookingStatus.PENDING);

        assertNotNull(newBookSlot);
        assertEquals(1L, newBookSlot.getId());
        assertEquals(user, newBookSlot.getUser());
        assertEquals(chargingPort, newBookSlot.getChargingPort());
        assertEquals(car, newBookSlot.getCar());
        assertEquals(60, newBookSlot.getDuration());
        assertEquals(BookingStatus.PENDING, newBookSlot.getStatus());
    }

    @Test
    void testNoArgsConstructor() {
        BookSlot newBookSlot = new BookSlot();

        assertNotNull(newBookSlot);
        assertNull(newBookSlot.getId());
        assertNull(newBookSlot.getUser());
        assertNull(newBookSlot.getChargingPort());
        assertNull(newBookSlot.getCar());
        assertNull(newBookSlot.getBookingTime());
        assertNull(newBookSlot.getDuration());
        assertNull(newBookSlot.getStatus());
    }

    @Test
    void testEqualsAndHashCode() {
        LocalDateTime bookingTime = LocalDateTime.now().plusHours(1);

        BookSlot bookSlot1 = new BookSlot();
        bookSlot1.setId(1L);
        bookSlot1.setBookingTime(bookingTime);
        bookSlot1.setDuration(60);
        bookSlot1.setStatus(BookingStatus.PENDING);

        BookSlot bookSlot2 = new BookSlot();
        bookSlot2.setId(1L);
        bookSlot2.setBookingTime(bookingTime);
        bookSlot2.setDuration(60);
        bookSlot2.setStatus(BookingStatus.PENDING);

        // Even with different relationships, bookings should be equal if core properties match
        bookSlot1.setUser(user);
        bookSlot2.setUser(new User()); // different user
        bookSlot1.setCar(car);
        bookSlot2.setCar(new Car()); // different car
        bookSlot1.setChargingPort(chargingPort);
        bookSlot2.setChargingPort(new ChargingPort()); // different charging port

        assertEquals(bookSlot1, bookSlot2, "BookSlots with same core properties should be equal");
        assertEquals(bookSlot1.hashCode(), bookSlot2.hashCode(), "Hash codes should match for equal BookSlots");

        // Verify changing a core property makes them unequal
        bookSlot2.setDuration(120);
        assertNotEquals(bookSlot1, bookSlot2, "BookSlots with different durations should not be equal");
    }
}
