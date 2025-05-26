package chargercontrol.operatorapi.dto;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import chargercontrol.operatorapi.dto.ChargingPortRequest;
import chargercontrol.operatorapi.model.ChargingPortStatus;

class ChargingPortRequestTest {

    @Test
    void testGettersAndSetters() {
        ChargingPortRequest dto = new ChargingPortRequest();
        dto.setPortIdentifier("port-1");
        dto.setStatus(ChargingPortStatus.AVAILABLE);
        dto.setEnergyUsed(12.5);

        assertEquals("port-1", dto.getPortIdentifier());
        assertEquals(ChargingPortStatus.AVAILABLE, dto.getStatus());
        assertEquals(12.5, dto.getEnergyUsed());
    }
}
