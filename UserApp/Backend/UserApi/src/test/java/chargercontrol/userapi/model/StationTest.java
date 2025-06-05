package chargercontrol.userapi.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class StationTest {

    private Station station;
    private ChargingPort port1;
    private ChargingPort port2;

    @BeforeEach
    void setUp() {
        station = new Station();
        station.setId(1L);
        station.setName("Test Station");
        station.setLocation("123 Test St");
        station.setPower(100.0);
        station.setLatitude(40.7128);
        station.setLongitude(-74.0060);
        station.setAvailable(true);
        station.setChargingType(ChargingType.FAST);

        port1 = new ChargingPort();
        port1.setId(1L);
        port1.setPortIdentifier("A01");
        port1.setStatus(ChargingPortStatus.AVAILABLE);

        port2 = new ChargingPort();
        port2.setId(2L);
        port2.setPortIdentifier("A02");
        port2.setStatus(ChargingPortStatus.OCCUPIED);
    }

    @Test
    void testAddChargingPort() {
        station.addChargingPort(port1);
        assertEquals(1, station.getChargingPorts().size());
        assertTrue(station.getChargingPorts().contains(port1));
    }

    @Test
    void testRemoveChargingPort() {
        station.addChargingPort(port1);
        station.addChargingPort(port2);
        station.removeChargingPort(port1);
        assertEquals(1, station.getChargingPorts().size());
        assertFalse(station.getChargingPorts().contains(port1));
    }

    @Test
    void testTotalPorts() {
        station.addChargingPort(port1);
        station.addChargingPort(port2);
        assertEquals(2, station.getChargingPorts().size());
    }

    @Test
    void testAvailablePorts() {
        station.addChargingPort(port1);
        station.addChargingPort(port2);
        long availablePorts = station.getChargingPorts().stream()
                .filter(port -> port.getStatus() == ChargingPortStatus.AVAILABLE)
                .count();
        assertEquals(1, availablePorts);
    }
}