package chargercontrol.operatorapi.service;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import chargercontrol.operatorapi.model.Station;
import chargercontrol.operatorapi.repository.ChargingPortRepository;
import chargercontrol.operatorapi.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChargingPortServiceTest {

    @Mock
    private ChargingPortRepository chargingPortRepository;

    @Mock
    private StationRepository stationRepository;

    @InjectMocks
    private ChargingPortService chargingPortService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getChargingPortsByStationId_ShouldReturnPorts_WhenStationExists() {
        Long stationId = 1L;
        List<ChargingPort> ports = Arrays.asList(new ChargingPort(), new ChargingPort());

        when(stationRepository.existsById(stationId)).thenReturn(true);
        when(chargingPortRepository.findByStationId(stationId)).thenReturn(ports);

        List<ChargingPort> result = chargingPortService.getChargingPortsByStationId(stationId);

        assertEquals(2, result.size());
        verify(chargingPortRepository).findByStationId(stationId);
    }

    @Test
    void getChargingPortsByStationId_ShouldThrow_WhenStationNotFound() {
        Long stationId = 999L;
        when(stationRepository.existsById(stationId)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () ->
                chargingPortService.getChargingPortsByStationId(stationId));
    }

    @Test
    void getChargingPortsByStatus_ShouldReturnList() {
        ChargingPortStatus status = ChargingPortStatus.AVAILABLE;
        List<ChargingPort> ports = List.of(new ChargingPort());

        when(chargingPortRepository.findByStatus(status)).thenReturn(ports);

        List<ChargingPort> result = chargingPortService.getChargingPortsByStatus(status);

        assertEquals(1, result.size());
        verify(chargingPortRepository).findByStatus(status);
    }

    @Test
    void deleteChargingPort_ShouldDelete_WhenExists() {
        Long portId = 10L;
        when(chargingPortRepository.existsById(portId)).thenReturn(true);

        chargingPortService.deleteChargingPort(portId);

        verify(chargingPortRepository).deleteById(portId);
    }

    @Test
    void deleteChargingPort_ShouldThrow_WhenNotFound() {
        Long portId = 5L;
        when(chargingPortRepository.existsById(portId)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () ->
                chargingPortService.deleteChargingPort(portId));
    }

    @Test
    void getTotalEnergyUsedByStation_ShouldReturnSum() {
        Long stationId = 1L;

        ChargingPort port1 = new ChargingPort();
        port1.setEnergyUsed(10.0);

        ChargingPort port2 = new ChargingPort();
        port2.setEnergyUsed(20.5);

        when(chargingPortRepository.findByStationId(stationId)).thenReturn(List.of(port1, port2));

        double result = chargingPortService.getTotalEnergyUsedByStation(stationId);

        assertEquals(30.5, result);
    }

    @Test
    void createChargingPort_ShouldInitializeAndSave_WhenValid() {
        Long stationId = 1L;
        Station station = new Station();
        ChargingPort portToSave = new ChargingPort();

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(station));
        when(chargingPortRepository.save(any(ChargingPort.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChargingPort savedPort = chargingPortService.createChargingPort(stationId, portToSave);

        assertNotNull(savedPort.getStation());
        assertEquals(ChargingPortStatus.AVAILABLE, savedPort.getStatus());
        assertEquals(0.0, savedPort.getEnergyUsed());
        verify(chargingPortRepository).save(portToSave);
    }

    @Test
    void createChargingPort_ShouldThrow_WhenStationNotFound() {
        Long stationId = 99L;
        ChargingPort port = new ChargingPort();

        when(stationRepository.findById(stationId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                chargingPortService.createChargingPort(stationId, port));
    }
}
