package chargercontrol.userapi.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class ChargingPortTest {

    private Station testStation;

    @BeforeEach
    void setUp() {
        testStation = new Station();
        testStation.setId(10L);
        testStation.setName("Test Station");
        // Set other necessary Station properties if they impact ChargingPort
    }

    @Test
    void testNoArgsConstructorAndGettersSetters() {
        ChargingPort port = new ChargingPort();
        assertNotNull(port);

        port.setId(1L);
        port.setStatus(ChargingPortStatus.AVAILABLE);
        port.setEnergyUsed(5.5);
        port.setPortIdentifier("P01");
        port.setStation(testStation); // Set a station
        port.setBookSlots(new ArrayList<>());

        assertEquals(1L, port.getId());
        assertEquals(ChargingPortStatus.AVAILABLE, port.getStatus());
        assertEquals(5.5, port.getEnergyUsed());
        assertEquals("P01", port.getPortIdentifier());
        assertEquals(testStation, port.getStation());
        assertNotNull(port.getBookSlots());
        assertTrue(port.getBookSlots().isEmpty());
    }

    @Test
    void testAllArgsConstructor() {
        List<BookSlot> slots = new ArrayList<>();
        slots.add(new BookSlot()); // Add a dummy BookSlot for testing list initialization

        ChargingPort port = new ChargingPort(2L, testStation, ChargingPortStatus.IN_USE,
                10.0, "P02", null, slots);
        assertNotNull(port);
        assertEquals(2L, port.getId());
        assertEquals(testStation, port.getStation());
        assertEquals(ChargingPortStatus.IN_USE, port.getStatus());
        assertEquals(10.0, port.getEnergyUsed());
        assertEquals("P02", port.getPortIdentifier());
        assertNull(port.getStationId()); // Should be null before populateStationId()
        assertFalse(port.getBookSlots().isEmpty());
        assertEquals(1, port.getBookSlots().size());
    }

    @Test
    void testDefaultValues() {
        ChargingPort port = new ChargingPort();
        assertEquals(0.0, port.getEnergyUsed(), "EnergyUsed should default to 0.0");
        assertNotNull(port.getBookSlots(), "BookSlots list should be initialized by default");
        assertTrue(port.getBookSlots().isEmpty(), "BookSlots list should be empty by default");
    }

    @Test
    void testPopulateStationId_withStation() {
        ChargingPort port = new ChargingPort();
        port.setStation(testStation); // Set the station

        port.populateStationId(); // Manually call the lifecycle method for testing

        assertEquals(testStation.getId(), port.getStationId(), "stationId should be populated from station's ID");
    }

    @Test
    void testPopulateStationId_withoutStation() {
        ChargingPort port = new ChargingPort();
        port.setStation(null); // Ensure no station is set

        port.populateStationId(); // Manually call the lifecycle method

        assertNull(port.getStationId(), "stationId should remain null if no station is set");
    }

    @Test
    void testBookSlotsGetterAndSetter() {
        ChargingPort port = new ChargingPort();
        List<BookSlot> slots = new ArrayList<>();
        slots.add(new BookSlot()); // Add a dummy slot

        port.setBookSlots(slots);
        assertThat(port.getBookSlots()).containsExactlyElementsOf(slots);

        port.setBookSlots(Collections.emptyList());
        assertThat(port.getBookSlots()).isEmpty();
    }


}