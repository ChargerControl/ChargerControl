package chargercontrol.operatorapi.controller;

import chargercontrol.operatorapi.controller.StationController;
import chargercontrol.operatorapi.model.ChargingType;
import chargercontrol.operatorapi.model.Station;
import chargercontrol.operatorapi.service.StationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StationController Tests")
class StationControllerTest {

    @Mock
    private StationService stationService;

    @InjectMocks
    private StationController stationController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(stationController)
                .setControllerAdvice() // Add controller advice for exception handling
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Should create station successfully")
    void createStation_Success() throws Exception {
        // Given
        Station inputStation = createValidStation();
        inputStation.setName("Test Station");
        inputStation.setLocation("Test Location");
        inputStation.setAvailable(true);

        Station savedStation = createValidStation();
        savedStation.setId(1L);
        savedStation.setName("Test Station");
        savedStation.setLocation("Test Location");
        savedStation.setAvailable(true);

        when(stationService.saveStation(any(Station.class))).thenReturn(savedStation);

        // When & Then
        mockMvc.perform(post("/apiV1/stations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputStation)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Station"))
                .andExpect(jsonPath("$.location").value("Test Location"))
                .andExpect(jsonPath("$.available").value(true));

        verify(stationService).saveStation(any(Station.class));
    }

    private Station createValidStation() {
        Station station = new Station();
        station.setName("Test Station");
        station.setLocation("Test Location");
        station.setPower(50.0); // em kW
        station.setLatitude(-23.5505);
        station.setLongitude(-46.6333);
        station.setAvailable(true);
        station.setChargingType(ChargingType.FAST); // ou o enum correspondente no seu projeto
        return station;
    }


    @Test
    @DisplayName("Should return all stations successfully")
    void getAllStations_Success() throws Exception {
        // Given
        Station station1 = createValidStation();
        station1.setId(1L);
        station1.setName("Station 1");
        station1.setLocation("Location 1");
        station1.setAvailable(true);

        Station station2 = createValidStation();
        station2.setId(2L);
        station2.setName("Station 2");
        station2.setLocation("Location 2");
        station2.setAvailable(false);

        List<Station> stations = Arrays.asList(station1, station2);

        when(stationService.getAllStations()).thenReturn(stations);

        // When & Then
        mockMvc.perform(get("/apiV1/stations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Station 1"))
                .andExpect(jsonPath("$[0].location").value("Location 1"))
                .andExpect(jsonPath("$[0].available").value(true))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Station 2"))
                .andExpect(jsonPath("$[1].location").value("Location 2"))
                .andExpect(jsonPath("$[1].available").value(false));

        verify(stationService).getAllStations();
    }

    @Test
    @DisplayName("Should return empty list when no stations exist")
    void getAllStations_EmptyList() throws Exception {
        // Given
        when(stationService.getAllStations()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/apiV1/stations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(0));

        verify(stationService).getAllStations();
    }

    @Test
    @DisplayName("Should return available stations successfully")
    void getStationsByAvailability_Available() throws Exception {
        // Given
        Station station1 = createValidStation();
        station1.setId(1L);
        station1.setName("Available Station 1");
        station1.setAvailable(true);

        Station station2 = createValidStation();
        station2.setId(2L);
        station2.setName("Available Station 2");
        station2.setAvailable(true);

        List<Station> availableStations = Arrays.asList(station1, station2);

        when(stationService.getStationsByAvailability(true)).thenReturn(availableStations);

        // When & Then
        mockMvc.perform(get("/apiV1/stations/available/{available}", true)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Available Station 1"))
                .andExpect(jsonPath("$[0].available").value(true))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Available Station 2"))
                .andExpect(jsonPath("$[1].available").value(true));

        verify(stationService).getStationsByAvailability(true);
    }

    @Test
    @DisplayName("Should return unavailable stations successfully")
    void getStationsByAvailability_Unavailable() throws Exception {
        // Given
        Station station1 = createValidStation();
        station1.setId(3L);
        station1.setName("Unavailable Station");
        station1.setAvailable(false);

        List<Station> unavailableStations = Arrays.asList(station1);

        when(stationService.getStationsByAvailability(false)).thenReturn(unavailableStations);

        // When & Then
        mockMvc.perform(get("/apiV1/stations/available/{available}", false)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(3))
                .andExpect(jsonPath("$[0].name").value("Unavailable Station"))
                .andExpect(jsonPath("$[0].available").value(false));

        verify(stationService).getStationsByAvailability(false);
    }

    @Test
    @DisplayName("Should return empty list when no stations match availability")
    void getStationsByAvailability_EmptyList() throws Exception {
        // Given
        when(stationService.getStationsByAvailability(true)).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/apiV1/stations/available/{available}", true)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(0));

        verify(stationService).getStationsByAvailability(true);
    }

    @Test
    @DisplayName("Should delete station successfully")
    void deleteStation_Success() throws Exception {
        // Given
        Long stationId = 1L;
        doNothing().when(stationService).deleteStation(stationId);

        // When & Then
        mockMvc.perform(delete("/apiV1/stations/{id}", stationId))
                .andExpect(status().isNoContent());

        verify(stationService).deleteStation(stationId);
    }

    @Test
    @DisplayName("Should return 404 when trying to delete non-existent station")
    void deleteStation_NotFound() throws Exception {
        // Given
        Long stationId = 999L;
        doThrow(new RuntimeException("Station not found"))
                .when(stationService).deleteStation(stationId);

        // When & Then
        mockMvc.perform(delete("/apiV1/stations/{id}", stationId))
                .andExpect(status().isNotFound());

        verify(stationService).deleteStation(stationId);
    }

    @Test
    @DisplayName("Should handle validation errors when creating station")
    void createStation_ValidationError() throws Exception {
        // Given - Station with invalid data (assuming name is required)
        Station invalidStation = new Station();
        // Not setting required fields

        // When & Then
        mockMvc.perform(post("/apiV1/stations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidStation)))
                .andExpect(status().isBadRequest());

        // Service should not be called for invalid data
        verify(stationService, never()).saveStation(any(Station.class));
    }

}