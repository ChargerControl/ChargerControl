package chargercontrol.userapi.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class ChargingPortServiceTest {

    @Mock
    private ChargingPortRepository chargingPortRepository;

    @Mock
    private StationRepository stationRepository;

    @InjectMocks
    private ChargingPortService chargingPortService;

    private Station testStation;
    private ChargingPort testPort;

    @BeforeEach
    void setUp() {
        testStation = new Station();
        testStation.setId(1L);
        testStation.setName("Test Station");

        testPort = new ChargingPort();
        testPort.setId(1L);
        testPort.setStation(testStation);
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);
        testPort.setPortIdentifier("A01");
    }

    @Test
    void createChargingPort_Success() {
        when(stationRepository.findById(testStation.getId())).thenReturn(Optional.of(testStation));
        when(chargingPortRepository.save(any(ChargingPort.class))).thenReturn(testPort);

        ChargingPort result = chargingPortService.createChargingPort(testStation.getId(), testPort);

        assertNotNull(result);
        assertEquals(testPort.getId(), result.getId());
        assertEquals(testStation, result.getStation());
        verify(chargingPortRepository).save(any(ChargingPort.class));
    }

    @Test
    void createChargingPort_WithNullStatus_SetsDefaultStatus() {
        testPort.setStatus(null);
        when(stationRepository.findById(testStation.getId())).thenReturn(Optional.of(testStation));
        when(chargingPortRepository.save(any(ChargingPort.class))).thenReturn(testPort);

        ChargingPort result = chargingPortService.createChargingPort(testStation.getId(), testPort);

        assertEquals(ChargingPortStatus.AVAILABLE, result.getStatus());
    }

    @Test
    void createChargingPort_StationNotFound_ThrowsException() {
        when(stationRepository.findById(testStation.getId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
            () -> chargingPortService.createChargingPort(testStation.getId(), testPort));
    }

    @Test
    void getChargingPortById_Success() {
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));

        ChargingPort result = chargingPortService.getChargingPortById(testPort.getId());

        assertNotNull(result);
        assertEquals(testPort.getId(), result.getId());
    }

    @Test
    void getChargingPortById_NotFound_ThrowsException() {
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
            () -> chargingPortService.getChargingPortById(testPort.getId()));
    }

    @Test
    void getChargingPortsByStationId_Success() {
        when(stationRepository.existsById(testStation.getId())).thenReturn(true);
        when(chargingPortRepository.findByStationId(testStation.getId()))
            .thenReturn(Arrays.asList(testPort));

        List<ChargingPort> result = chargingPortService.getChargingPortsByStationId(testStation.getId());

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testPort.getId(), result.get(0).getId());
    }

    @Test
    void getChargingPortsByStationId_StationNotFound_ThrowsException() {
        when(stationRepository.existsById(testStation.getId())).thenReturn(false);

        assertThrows(EntityNotFoundException.class,
            () -> chargingPortService.getChargingPortsByStationId(testStation.getId()));
    }

    @Test
    void getChargingPortsByStationIdAndStatus_Success() {
        when(stationRepository.existsById(testStation.getId())).thenReturn(true);
        when(chargingPortRepository.findByStationIdAndStatus(testStation.getId(), ChargingPortStatus.AVAILABLE))
            .thenReturn(Arrays.asList(testPort));

        List<ChargingPort> result = chargingPortService.getChargingPortsByStationIdAndStatus(
            testStation.getId(), ChargingPortStatus.AVAILABLE);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(ChargingPortStatus.AVAILABLE, result.get(0).getStatus());
    }

    @Test
    void getChargingPortsByStationIdAndStatus_NoPortsFound_ReturnsEmptyList() {
        when(stationRepository.existsById(testStation.getId())).thenReturn(true);
        when(chargingPortRepository.findByStationIdAndStatus(testStation.getId(), ChargingPortStatus.OUT_OF_SERVICE))
            .thenReturn(Collections.emptyList());

        List<ChargingPort> result = chargingPortService.getChargingPortsByStationIdAndStatus(
            testStation.getId(), ChargingPortStatus.OUT_OF_SERVICE);

        assertTrue(result.isEmpty());
    }

    @Test
    void updateChargingPortStatus_Success() {
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(chargingPortRepository.save(any(ChargingPort.class))).thenReturn(testPort);

        ChargingPort result = chargingPortService.updateChargingPortStatus(
            testPort.getId(), ChargingPortStatus.CHARGING);

        assertEquals(ChargingPortStatus.CHARGING, result.getStatus());
        verify(chargingPortRepository).save(any(ChargingPort.class));
    }

    @Test
    void updateChargingPortStatus_PortNotFound_ThrowsException() {
        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
            () -> chargingPortService.updateChargingPortStatus(testPort.getId(), ChargingPortStatus.CHARGING));
    }

    @Test
    void updateChargingPort_Success() {
        ChargingPort updatedDetails = new ChargingPort();
        updatedDetails.setPortIdentifier("B02");
        updatedDetails.setStatus(ChargingPortStatus.MAINTENANCE);

        when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
        when(chargingPortRepository.save(any(ChargingPort.class))).thenReturn(testPort);

        ChargingPort result = chargingPortService.updateChargingPort(testPort.getId(), updatedDetails);

        assertNotNull(result);
        assertEquals("B02", result.getPortIdentifier());
        assertEquals(ChargingPortStatus.MAINTENANCE, result.getStatus());
        // Verify station wasn't changed
        assertEquals(testStation, result.getStation());
    }

    @Test
    void updateChargingPort_NotFound_ThrowsException() {
        ChargingPort updatedDetails = new ChargingPort();
        when(chargingPortRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
            () -> chargingPortService.updateChargingPort(999L, updatedDetails));
    }

    @Test
    void updateChargingPortStatus_TransitionToAllStatuses() {
        for (ChargingPortStatus newStatus : ChargingPortStatus.values()) {
            when(chargingPortRepository.findById(testPort.getId())).thenReturn(Optional.of(testPort));
            when(chargingPortRepository.save(any(ChargingPort.class))).thenAnswer(i -> i.getArguments()[0]);

            ChargingPort result = chargingPortService.updateChargingPortStatus(testPort.getId(), newStatus);

            assertEquals(newStatus, result.getStatus());
            assertEquals(testPort.getPortIdentifier(), result.getPortIdentifier());
            assertEquals(testPort.getEnergyUsed(), result.getEnergyUsed());
        }
    }

    @Test
    void createChargingPort_WithMaximumEnergyUsed() {
        testPort.setEnergyUsed(Double.MAX_VALUE);
        when(stationRepository.findById(testStation.getId())).thenReturn(Optional.of(testStation));
        when(chargingPortRepository.save(any(ChargingPort.class))).thenReturn(testPort);

        ChargingPort result = chargingPortService.createChargingPort(testStation.getId(), testPort);

        assertEquals(Double.MAX_VALUE, result.getEnergyUsed());
    }

    @Test
    void getChargingPortsByStationIdAndStatus_MultipleStatusTypes() {
        ChargingPort availablePort = createTestPort(1L, ChargingPortStatus.AVAILABLE);
        ChargingPort chargingPort = createTestPort(2L, ChargingPortStatus.CHARGING);
        ChargingPort maintenancePort = createTestPort(3L, ChargingPortStatus.MAINTENANCE);

        when(stationRepository.existsById(testStation.getId())).thenReturn(true);

        // Test AVAILABLE ports
        when(chargingPortRepository.findByStationIdAndStatus(testStation.getId(), ChargingPortStatus.AVAILABLE))
            .thenReturn(Collections.singletonList(availablePort));
        List<ChargingPort> availablePorts = chargingPortService.getChargingPortsByStationIdAndStatus(
            testStation.getId(), ChargingPortStatus.AVAILABLE);
        assertEquals(1, availablePorts.size());
        assertEquals(ChargingPortStatus.AVAILABLE, availablePorts.get(0).getStatus());

        // Test CHARGING ports
        when(chargingPortRepository.findByStationIdAndStatus(testStation.getId(), ChargingPortStatus.CHARGING))
            .thenReturn(Collections.singletonList(chargingPort));
        List<ChargingPort> chargingPorts = chargingPortService.getChargingPortsByStationIdAndStatus(
            testStation.getId(), ChargingPortStatus.CHARGING);
        assertEquals(1, chargingPorts.size());
        assertEquals(ChargingPortStatus.CHARGING, chargingPorts.get(0).getStatus());

        // Test MAINTENANCE ports
        when(chargingPortRepository.findByStationIdAndStatus(testStation.getId(), ChargingPortStatus.MAINTENANCE))
            .thenReturn(Collections.singletonList(maintenancePort));
        List<ChargingPort> maintenancePorts = chargingPortService.getChargingPortsByStationIdAndStatus(
            testStation.getId(), ChargingPortStatus.MAINTENANCE);
        assertEquals(1, maintenancePorts.size());
        assertEquals(ChargingPortStatus.MAINTENANCE, maintenancePorts.get(0).getStatus());
    }

    private ChargingPort createTestPort(Long id, ChargingPortStatus status) {
        ChargingPort port = new ChargingPort();
        port.setId(id);
        port.setStation(testStation);
        port.setStatus(status);
        port.setPortIdentifier("PORT" + id);
        port.setEnergyUsed(0.0);
        return port;
    }
}
