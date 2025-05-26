package chargercontrol.operatorapi.service;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.Station;
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

}
