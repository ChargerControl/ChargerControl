package chargercontrol.userapi.model;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class ChargingPortTest {

    private static Validator validator;
    private ChargingPort chargingPort;
    private Station station;

    @BeforeAll
    static void setupValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @BeforeEach
    void setUp() {
        station = new Station();
        station.setId(1L);
        station.setName("Test Station");

        chargingPort = new ChargingPort();
        chargingPort.setId(1L);
        chargingPort.setStation(station);
        chargingPort.setStatus(ChargingPortStatus.AVAILABLE);
        chargingPort.setEnergyUsed(0.0);
        chargingPort.setPortIdentifier("A01");
    }

    @Test
    void whenAllFieldsAreValid_thenNoValidationViolations() {
        Set<jakarta.validation.ConstraintViolation<ChargingPort>> violations = validator.validate(chargingPort);
        assertTrue(violations.isEmpty());
    }

    @Test
    void whenStationIsNull_thenValidationFails() {
        chargingPort.setStation(null);
        Set<jakarta.validation.ConstraintViolation<ChargingPort>> violations = validator.validate(chargingPort);

        assertFalse(violations.isEmpty());
        assertEquals("Station cannot be null", violations.iterator().next().getMessage());
    }

    @Test
    void whenStatusIsNull_thenValidationFails() {
        chargingPort.setStatus(null);
        Set<jakarta.validation.ConstraintViolation<ChargingPort>> violations = validator.validate(chargingPort);

        assertFalse(violations.isEmpty());
        assertEquals("Charging port status is required", violations.iterator().next().getMessage());
    }

    @Test
    void whenEnergyUsedIsNegative_thenValidationFails() {
        chargingPort.setEnergyUsed(-1.0);
        Set<jakarta.validation.ConstraintViolation<ChargingPort>> violations = validator.validate(chargingPort);

        assertFalse(violations.isEmpty());
        assertEquals("Energy used must be zero or positive", violations.iterator().next().getMessage());
    }

    @Test
    void whenPortIdentifierIsNull_thenValidationFails() {
        chargingPort.setPortIdentifier(null);
        Set<jakarta.validation.ConstraintViolation<ChargingPort>> violations = validator.validate(chargingPort);

        assertFalse(violations.isEmpty());
    }

    @Test
    void testAllArgsConstructor() {
        ChargingPort port = new ChargingPort(1L, station, ChargingPortStatus.AVAILABLE, 0.0, null, "A01");

        assertNotNull(port);
        assertEquals(1L, port.getId());
        assertEquals(station, port.getStation());
        assertEquals(ChargingPortStatus.AVAILABLE, port.getStatus());
        assertEquals(0.0, port.getEnergyUsed());
        assertEquals("A01", port.getPortIdentifier());
    }

    @Test
    void testNoArgsConstructor() {
        ChargingPort port = new ChargingPort();

        assertNotNull(port);
        assertNull(port.getId());
        assertNull(port.getStation());
        assertNull(port.getStatus());
        assertNull(port.getBookSlots());
        assertNull(port.getPortIdentifier());
    }
}
