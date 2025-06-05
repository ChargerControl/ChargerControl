package chargercontrol.userapi.service;

import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat; // For fluent assertions

class StationServiceTest {

    @Mock
    private StationRepository stationRepository; // Mock the dependency

    @InjectMocks
    private StationService stationService; // Inject mocks into the service under test

    private Station testStation;
    private Station testStation2;
    private ChargingPort testPort;

    @BeforeEach
    void setUp() {
        // Initialize mocks before each test
        MockitoAnnotations.openMocks(this);

        // Setup common test data
        testStation = new Station();
        testStation.setId(1L);
        testStation.setName("Test Station A");
        testStation.setLocation("Location A");
        testStation.setAvailable(true);

        testStation2 = new Station();
        testStation2.setId(2L);
        testStation2.setName("Test Station B");
        testStation2.setLocation("Location B");
        testStation2.setAvailable(false);

        testPort = new ChargingPort();
        testPort.setId(101L);
        testPort.setPortIdentifier("PortA1");
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);
        // Note: The 'station' field of testPort is typically set in the service method itself
        // or explicitly in test cases that involve its association.
    }

    // --- Test for saveStation method ---
    @Test
    void saveStation_withNoPorts() {
        when(stationRepository.save(any(Station.class))).thenReturn(testStation);

        Station savedStation = stationService.saveStation(testStation);

        assertNotNull(savedStation);
        assertEquals(testStation.getId(), savedStation.getId());
        // Verify that save was called with the correct station object
        verify(stationRepository, times(1)).save(testStation);
    }

    @Test
    void saveStation_withPorts() {
        testStation.setChargingPorts(new ArrayList<>(Collections.singletonList(testPort)));
        // We expect the service to set the station on the port before saving
        // So, we use an ArgumentCaptor or check the argument passed to save.
        when(stationRepository.save(any(Station.class))).thenReturn(testStation);

        Station savedStation = stationService.saveStation(testStation);

        assertNotNull(savedStation);
        assertEquals(testStation.getId(), savedStation.getId());
        assertThat(savedStation.getChargingPorts()).hasSize(1);
        // Verify that the port's station was set before saving
        assertEquals(testStation, savedStation.getChargingPorts().get(0).getStation());

        // Verify save was called
        verify(stationRepository, times(1)).save(testStation);
    }

    @Test
    void saveStation_withNullPorts() {
        testStation.setChargingPorts(null); // Ensure ports list is null
        when(stationRepository.save(any(Station.class))).thenReturn(testStation);

        Station savedStation = stationService.saveStation(testStation);

        assertNotNull(savedStation);
        verify(stationRepository, times(1)).save(testStation);
        assertNull(savedStation.getChargingPorts()); // Still null if input was null
    }

    // --- Test for getAllStations method ---
    @Test
    void getAllStations_returnsListOfStations() {
        List<Station> stations = Arrays.asList(testStation, testStation2);
        when(stationRepository.findAll()).thenReturn(stations);

        List<Station> result = stationService.getAllStations();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertThat(result).containsExactly(testStation, testStation2);
        verify(stationRepository, times(1)).findAll();
    }

    @Test
    void getAllStations_returnsEmptyListWhenNoStations() {
        when(stationRepository.findAll()).thenReturn(Collections.emptyList());

        List<Station> result = stationService.getAllStations();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(stationRepository, times(1)).findAll();
    }

    // --- Test for getStationById method ---
    @Test
    void getStationById_found() {
        when(stationRepository.findById(1L)).thenReturn(Optional.of(testStation));

        Optional<Station> result = stationService.getStationById(1L);

        assertTrue(result.isPresent());
        assertEquals(testStation.getId(), result.get().getId());
        verify(stationRepository, times(1)).findById(1L);
    }

    @Test
    void getStationById_notFound() {
        when(stationRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Station> result = stationService.getStationById(99L);

        assertFalse(result.isPresent());
        verify(stationRepository, times(1)).findById(99L);
    }

    // --- Test for getStationByName method ---
    @Test
    void getStationByName_found() {
        when(stationRepository.findByName("Test Station A")).thenReturn(Optional.of(testStation));

        Optional<Station> result = stationService.getStationByName("Test Station A");

        assertTrue(result.isPresent());
        assertEquals(testStation.getName(), result.get().getName());
        verify(stationRepository, times(1)).findByName("Test Station A");
    }

    @Test
    void getStationByName_notFound() {
        when(stationRepository.findByName("Non Existent")).thenReturn(Optional.empty());

        Optional<Station> result = stationService.getStationByName("Non Existent");

        assertFalse(result.isPresent());
        verify(stationRepository, times(1)).findByName("Non Existent");
    }

    // --- Test for updateStation method ---
    @Test
    void updateStation_successWithNoPortsInDetails() {
        // Mock existing station retrieval
        when(stationRepository.findById(1L)).thenReturn(Optional.of(testStation));
        // Mock save operation
        when(stationRepository.save(any(Station.class))).thenReturn(testStation);

        Station stationDetails = new Station();
        stationDetails.setName("Updated Name");
        stationDetails.setLocation("Updated Location");
        stationDetails.setAvailable(false); // Change a field

        Station updatedStation = stationService.updateStation(1L, stationDetails);

        assertNotNull(updatedStation);
        assertEquals(1L, updatedStation.getId());
        assertEquals("Updated Name", updatedStation.getName());
        assertEquals("Updated Location", updatedStation.getLocation());
        assertEquals(false, updatedStation.getAvailable()); // Check the updated field
        verify(stationRepository, times(1)).findById(1L);
        verify(stationRepository, times(1)).save(testStation); // Ensure save is called on the original object
    }

    @Test
    void updateStation_successWithUpdatingPorts() {
        // Original station with existing ports
        ChargingPort existingPort = new ChargingPort();
        existingPort.setId(200L);
        existingPort.setPortIdentifier("OldPort");
        existingPort.setStation(testStation); // Simulate existing association
        testStation.addChargingPort(existingPort);

        // New port details to be updated
        ChargingPort newPort1 = new ChargingPort();
        newPort1.setPortIdentifier("NewPort1");
        newPort1.setStatus(ChargingPortStatus.AVAILABLE);

        ChargingPort newPort2 = new ChargingPort();
        newPort2.setPortIdentifier("NewPort2");
        newPort2.setStatus(ChargingPortStatus.IN_USE);

        Station stationDetailsWithPorts = new Station();
        stationDetailsWithPorts.setName("Updated Name With Ports");
        stationDetailsWithPorts.setChargingPorts(Arrays.asList(newPort1, newPort2));

        // Mock existing station retrieval
        when(stationRepository.findById(1L)).thenReturn(Optional.of(testStation));
        // Mock save operation
        when(stationRepository.save(any(Station.class))).thenReturn(testStation); // Return the modified testStation

        Station updatedStation = stationService.updateStation(1L, stationDetailsWithPorts);

        assertNotNull(updatedStation);
        assertEquals("Updated Name With Ports", updatedStation.getName());
        assertThat(updatedStation.getChargingPorts()).hasSize(2);
        // Verify that the old port is removed and new ones are added and linked
        assertThat(updatedStation.getChargingPorts()).extracting(ChargingPort::getPortIdentifier)
                .containsExactlyInAnyOrder("NewPort1", "NewPort2");
        assertThat(updatedStation.getChargingPorts()).allMatch(port -> port.getStation().equals(testStation));

        verify(stationRepository, times(1)).findById(1L);
        verify(stationRepository, times(1)).save(testStation);
    }


    @Test
    void updateStation_notFoundThrowsException() {
        when(stationRepository.findById(99L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(EntityNotFoundException.class, () ->
                stationService.updateStation(99L, new Station()));

        assertEquals("Station not found with id: 99", exception.getMessage());
        verify(stationRepository, times(1)).findById(99L);
        verify(stationRepository, never()).save(any(Station.class)); // Save should not be called
    }

    // --- Test for deleteStation method ---
    @Test
    void deleteStation_success() {
        when(stationRepository.existsById(1L)).thenReturn(true);
        doNothing().when(stationRepository).deleteById(1L); // Explicitly define void method behavior

        assertDoesNotThrow(() -> stationService.deleteStation(1L));

        verify(stationRepository, times(1)).existsById(1L);
        verify(stationRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteStation_notFoundThrowsException() {
        when(stationRepository.existsById(99L)).thenReturn(false);

        Exception exception = assertThrows(EntityNotFoundException.class, () ->
                stationService.deleteStation(99L));

        assertEquals("Station not found with id: 99", exception.getMessage());
        verify(stationRepository, times(1)).existsById(99L);
        verify(stationRepository, never()).deleteById(anyLong()); // Delete should not be called
    }

    // --- Test for getStationsByAvailability method ---
    @Test
    void getStationsByAvailability_returnsAvailableStations() {
        List<Station> availableStations = Collections.singletonList(testStation);
        when(stationRepository.findByAvailable(true)).thenReturn(availableStations);

        List<Station> result = stationService.getStationsByAvailability(true);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertThat(result).containsExactly(testStation);
        verify(stationRepository, times(1)).findByAvailable(true);
    }

    @Test
    void getStationsByAvailability_returnsUnavailableStations() {
        List<Station> unavailableStations = Collections.singletonList(testStation2);
        when(stationRepository.findByAvailable(false)).thenReturn(unavailableStations);

        List<Station> result = stationService.getStationsByAvailability(false);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertThat(result).containsExactly(testStation2);
        verify(stationRepository, times(1)).findByAvailable(false);
    }

    @Test
    void getStationsByAvailability_returnsEmptyList() {
        when(stationRepository.findByAvailable(anyBoolean())).thenReturn(Collections.emptyList());

        List<Station> result = stationService.getStationsByAvailability(true);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(stationRepository, times(1)).findByAvailable(true);
    }
}