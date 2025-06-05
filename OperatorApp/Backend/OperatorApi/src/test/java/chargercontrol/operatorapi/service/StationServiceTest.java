package chargercontrol.operatorapi.service;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.Station;
import chargercontrol.operatorapi.model.ChargingType;
import chargercontrol.operatorapi.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StationServiceTest {

    @Mock
    private StationRepository stationRepository;

    @InjectMocks
    private StationService stationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void saveStation_ShouldSaveSuccessfully() {
        Station station = new Station();
        when(stationRepository.save(any(Station.class))).thenReturn(station);

        Station result = stationService.saveStation(station);

        assertNotNull(result);
        verify(stationRepository).save(station);
    }

    @Test
    void getAllStations_ShouldReturnListOfStations() {
        List<Station> stations = Arrays.asList(new Station(), new Station());
        when(stationRepository.findAll()).thenReturn(stations);

        List<Station> result = stationService.getAllStations();

        assertEquals(2, result.size());
        verify(stationRepository).findAll();
    }

    @Test
    void getStationsByAvailability_ShouldReturnMatchingStations() {
        List<Station> stations = List.of(new Station());
        when(stationRepository.findByAvailable(true)).thenReturn(stations);

        List<Station> result = stationService.getStationsByAvailability(true);

        assertEquals(1, result.size());
        verify(stationRepository).findByAvailable(true);
    }

    @Test
    void deleteStation_ShouldDeleteIfExists() {
        Long id = 1L;
        when(stationRepository.existsById(id)).thenReturn(true);

        stationService.deleteStation(id);

        verify(stationRepository).deleteById(id);
    }

    @Test
    void deleteStation_ShouldThrowIfNotFound() {
        Long id = 2L;
        when(stationRepository.existsById(id)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> stationService.deleteStation(id));
    }

    @Test
    void getStationById_ShouldReturnStation_WhenExists() {
        Long id = 1L;
        Station station = new Station();
        station.setId(id);

        when(stationRepository.findById(id)).thenReturn(Optional.of(station));

        Station result = stationService.getStationById(id);

        assertNotNull(result);
        assertEquals(id, result.getId());
        verify(stationRepository).findById(id);
    }

    @Test
    void getStationById_ShouldThrow_WhenNotFound() {
        Long id = 999L;
        when(stationRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> stationService.getStationById(id));
        verify(stationRepository).findById(id);
    }

    @Test
    void saveStation_ShouldHandleNullChargingPorts() {
        Station station = new Station();
        station.setChargingPorts(null);  // explicitly null

        when(stationRepository.save(any(Station.class))).thenReturn(station);

        Station result = stationService.saveStation(station);

        assertNotNull(result);
        verify(stationRepository).save(station);
    }

    @Test
    void saveStation_ShouldSetStationInChargingPorts() {
        Station station = new Station();
        ChargingPort port1 = new ChargingPort();
        ChargingPort port2 = new ChargingPort();

        station.setChargingPorts(List.of(port1, port2));

        when(stationRepository.save(any(Station.class))).thenReturn(station);

        Station result = stationService.saveStation(station);

        // Verifica se o station foi setado corretamente em cada port
        assertEquals(station, port1.getStation());
        assertEquals(station, port2.getStation());
        verify(stationRepository).save(station);
    }

    // TESTES PARA updateStation
    @Test
    void updateStation_ShouldUpdateBasicFields_WhenStationExists() {
        // Given
        Long stationId = 1L;
        Station existingStation = new Station();
        existingStation.setId(stationId);
        existingStation.setName("Old Name");
        existingStation.setLocation("Old Location");
        existingStation.setPower(50.0);
        existingStation.setLatitude(40.0);
        existingStation.setLongitude(-8.0);
        existingStation.setChargingType(ChargingType.AC);
        existingStation.setAvailable(true);
        existingStation.setChargingPorts(new ArrayList<>());

        Station updateData = new Station();
        updateData.setName("New Name");
        updateData.setLocation("New Location");
        updateData.setPower(100.0);
        updateData.setLatitude(41.0);
        updateData.setLongitude(-9.0);
        updateData.setChargingType(ChargingType.DC);

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(existingStation));
        when(stationRepository.save(any(Station.class))).thenReturn(existingStation);

        // When
        Station result = stationService.updateStation(stationId, updateData);

        // Then
        assertEquals("New Name", result.getName());
        assertEquals("New Location", result.getLocation());
        assertEquals(100.0, result.getPower());
        assertEquals(41.0, result.getLatitude());
        assertEquals(-9.0, result.getLongitude());
        assertEquals(ChargingType.DC, result.getChargingType());
        verify(stationRepository).findById(stationId);
        verify(stationRepository).save(existingStation);
    }

    @Test
    void updateStation_ShouldUpdateAvailability_WhenProvided() {
        // Given
        Long stationId = 1L;
        Station existingStation = new Station();
        existingStation.setId(stationId);
        existingStation.setAvailable(true);
        existingStation.setChargingPorts(new ArrayList<>());

        Station updateData = new Station();
        updateData.setAvailable(false);

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(existingStation));
        when(stationRepository.save(any(Station.class))).thenReturn(existingStation);

        // When
        Station result = stationService.updateStation(stationId, updateData);

        // Then
        assertFalse(result.getAvailable());
        verify(stationRepository).save(existingStation);
    }

    @Test
    void updateStation_ShouldNotUpdateAvailability_WhenNull() {
        // Given
        Long stationId = 1L;
        Station existingStation = new Station();
        existingStation.setId(stationId);
        existingStation.setAvailable(true);
        existingStation.setChargingPorts(new ArrayList<>());

        Station updateData = new Station();
        updateData.setAvailable(null); // explicitly null

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(existingStation));
        when(stationRepository.save(any(Station.class))).thenReturn(existingStation);

        // When
        Station result = stationService.updateStation(stationId, updateData);

        // Then
        assertTrue(result.getAvailable()); // Should remain unchanged
        verify(stationRepository).save(existingStation);
    }

    @Test
    void updateStation_ShouldUpdateChargingPorts_WhenProvided() {
        // Given
        Long stationId = 1L;
        Station existingStation = new Station();
        existingStation.setId(stationId);
        existingStation.setChargingPorts(new ArrayList<>());
        
        // Add some existing ports
        ChargingPort oldPort = new ChargingPort();
        oldPort.setId(1L);
        existingStation.getChargingPorts().add(oldPort);

        Station updateData = new Station();
        ChargingPort newPort1 = new ChargingPort();
        ChargingPort newPort2 = new ChargingPort();
        updateData.setChargingPorts(List.of(newPort1, newPort2));

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(existingStation));
        when(stationRepository.save(any(Station.class))).thenReturn(existingStation);

        // When
        Station result = stationService.updateStation(stationId, updateData);

        // Then
        assertEquals(2, result.getChargingPorts().size());
        // Verify old ports were cleared and new ones added
        verify(stationRepository).save(existingStation);
    }

    @Test
    void updateStation_ShouldNotUpdateChargingPorts_WhenNull() {
        // Given
        Long stationId = 1L;
        Station existingStation = new Station();
        existingStation.setId(stationId);
        existingStation.setChargingPorts(new ArrayList<>());
        
        ChargingPort existingPort = new ChargingPort();
        existingStation.getChargingPorts().add(existingPort);

        Station updateData = new Station();
        updateData.setChargingPorts(null); // explicitly null

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(existingStation));
        when(stationRepository.save(any(Station.class))).thenReturn(existingStation);

        // When
        Station result = stationService.updateStation(stationId, updateData);

        // Then
        assertEquals(1, result.getChargingPorts().size()); // Should remain unchanged
        verify(stationRepository).save(existingStation);
    }

    @Test
    void updateStation_ShouldThrowException_WhenStationNotFound() {
        // Given
        Long stationId = 999L;
        Station updateData = new Station();
        updateData.setName("New Name");

        when(stationRepository.findById(stationId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, 
                () -> stationService.updateStation(stationId, updateData));
        
        verify(stationRepository).findById(stationId);
        verify(stationRepository, never()).save(any(Station.class));
    }

    @Test
    void updateStation_ShouldHandleEmptyChargingPortsList() {
        // Given
        Long stationId = 1L;
        Station existingStation = new Station();
        existingStation.setId(stationId);
        existingStation.setChargingPorts(new ArrayList<>());
        
        ChargingPort existingPort = new ChargingPort();
        existingStation.getChargingPorts().add(existingPort);

        Station updateData = new Station();
        updateData.setChargingPorts(new ArrayList<>()); // empty list

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(existingStation));
        when(stationRepository.save(any(Station.class))).thenReturn(existingStation);

        // When
        Station result = stationService.updateStation(stationId, updateData);

        // Then
        assertTrue(result.getChargingPorts().isEmpty()); // Should be cleared
        verify(stationRepository).save(existingStation);
    }

    @Test
    void updateStation_ShouldUpdateAllFieldsAtOnce() {
        // Given
        Long stationId = 1L;
        Station existingStation = new Station();
        existingStation.setId(stationId);
        existingStation.setName("Old Name");
        existingStation.setLocation("Old Location");
        existingStation.setPower(50.0);
        existingStation.setLatitude(40.0);
        existingStation.setLongitude(-8.0);
        existingStation.setChargingType(ChargingType.AC);
        existingStation.setAvailable(true);
        existingStation.setChargingPorts(new ArrayList<>());

        Station updateData = new Station();
        updateData.setName("Updated Name");
        updateData.setLocation("Updated Location");
        updateData.setPower(150.0);
        updateData.setLatitude(42.0);
        updateData.setLongitude(-7.0);
        updateData.setChargingType(ChargingType.DC);
        updateData.setAvailable(false);
        
        ChargingPort newPort = new ChargingPort();
        updateData.setChargingPorts(List.of(newPort));

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(existingStation));
        when(stationRepository.save(any(Station.class))).thenReturn(existingStation);

        // When
        Station result = stationService.updateStation(stationId, updateData);

        // Then
        assertEquals("Updated Name", result.getName());
        assertEquals("Updated Location", result.getLocation());
        assertEquals(150.0, result.getPower());
        assertEquals(42.0, result.getLatitude());
        assertEquals(-7.0, result.getLongitude());
        assertEquals(ChargingType.DC, result.getChargingType());
        assertFalse(result.getAvailable());
        assertEquals(1, result.getChargingPorts().size());
        
        verify(stationRepository).findById(stationId);
        verify(stationRepository).save(existingStation);
    }
}