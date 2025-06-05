package chargercontrol.userapi.dto;

import chargercontrol.userapi.model.ChargingPortStatus;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ChargingPortRequestTest {

    @Test
    void testGettersAndSetters() {
        // Arrange
        ChargingPortRequest request = new ChargingPortRequest();
        String testPortIdentifier = "PortA1";
        ChargingPortStatus testStatus = ChargingPortStatus.AVAILABLE;
        Double testEnergyUsed = 15.5;

        // Act
        request.setPortIdentifier(testPortIdentifier);
        request.setStatus(testStatus);
        request.setEnergyUsed(testEnergyUsed);

        // Assert
        assertEquals(testPortIdentifier, request.getPortIdentifier());
        assertEquals(testStatus, request.getStatus());
        assertEquals(testEnergyUsed, request.getEnergyUsed());
    }

    @Test
    void testDefaultValues() {
        // Arrange
        ChargingPortRequest request = new ChargingPortRequest();

        // Assert (should be null since no values were set)
        assertNull(request.getPortIdentifier());
        assertNull(request.getStatus());
        assertNull(request.getEnergyUsed());
    }

    @Test
    void testSettersWithNull() {
        // Arrange
        ChargingPortRequest request = new ChargingPortRequest();

        // Act
        request.setPortIdentifier(null);
        request.setStatus(null);
        request.setEnergyUsed(null);

        // Assert
        assertNull(request.getPortIdentifier());
        assertNull(request.getStatus());
        assertNull(request.getEnergyUsed());
    }
}