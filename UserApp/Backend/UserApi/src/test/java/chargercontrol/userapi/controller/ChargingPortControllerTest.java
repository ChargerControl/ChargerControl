package chargercontrol.userapi.controller;

import chargercontrol.userapi.dto.ChargingPortRequest;
import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.service.ChargingPortService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ChargingPortControllerTest {

    private MockMvc mockMvc; // MockMvc is still used to simulate HTTP requests

    @Mock // This creates a mock instance of ChargingPortService
    private ChargingPortService chargingPortService;

    @InjectMocks // This injects the mocks (like chargingPortService) into ChargingPortController
    private ChargingPortController chargingPortController;

    private ObjectMapper objectMapper;

    private ChargingPort testPort1;
    private ChargingPort testPort2;
    private ChargingPortRequest testPortRequest;

    @BeforeEach
    void setUp() {
        // Initialize mocks created with @Mock and inject them into @InjectMocks fields
        MockitoAnnotations.openMocks(this);
        // Manually set up MockMvc with the controller instance
        mockMvc = MockMvcBuilders.standaloneSetup(chargingPortController).build();

        objectMapper = new ObjectMapper();

        testPort1 = new ChargingPort();
        testPort1.setId(1L);
        testPort1.setPortIdentifier("A001");
        testPort1.setStatus(ChargingPortStatus.AVAILABLE);
        testPort1.setEnergyUsed(100.5);
        testPort1.setStationId(10L);

        testPort2 = new ChargingPort();
        testPort2.setId(2L);
        testPort2.setPortIdentifier("B002");
        testPort2.setStatus(ChargingPortStatus.IN_USE);
        testPort2.setEnergyUsed(250.0);
        testPort2.setStationId(10L);

        testPortRequest = new ChargingPortRequest();
        testPortRequest.setPortIdentifier("C003");
        testPortRequest.setStatus(ChargingPortStatus.AVAILABLE);
        testPortRequest.setEnergyUsed(0.0);
    }

    // --- GET /apiV1/chargingports/station/{stationId} ---
    @Test
    void getChargingPortsByStationId_shouldReturnListOfPorts_whenPortsExist() throws Exception {
        Long stationId = 10L;
        List<ChargingPort> ports = Arrays.asList(testPort1, testPort2);
        when(chargingPortService.getChargingPortsByStationId(stationId)).thenReturn(ports);

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(testPort1.getId()))
                .andExpect(jsonPath("$[0].portIdentifier").value(testPort1.getPortIdentifier()))
                .andExpect(jsonPath("$[1].id").value(testPort2.getId()));

        verify(chargingPortService, times(1)).getChargingPortsByStationId(stationId);
    }

    @Test
    void getChargingPortsByStationId_shouldReturn404_whenStationNotFound() throws Exception {
        Long stationId = 99L;
        when(chargingPortService.getChargingPortsByStationId(stationId)).thenThrow(new EntityNotFoundException("Station not found"));

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(chargingPortService, times(1)).getChargingPortsByStationId(stationId);
    }

    @Test
    void getChargingPortsByStationId_shouldReturnEmptyList_whenNoPortsExist() throws Exception {
        Long stationId = 11L;
        when(chargingPortService.getChargingPortsByStationId(stationId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(chargingPortService, times(1)).getChargingPortsByStationId(stationId);
    }

    // --- GET /apiV1/chargingports/status/{status} ---
    @Test
    void getChargingPortsByStatus_shouldReturnListOfPorts_whenStatusMatches() throws Exception {
        ChargingPortStatus status = ChargingPortStatus.AVAILABLE;
        List<ChargingPort> ports = Collections.singletonList(testPort1);
        when(chargingPortService.getChargingPortsByStatus(status)).thenReturn(ports);

        mockMvc.perform(get("/apiV1/chargingports/status/{status}", status)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value(status.name()));

        verify(chargingPortService, times(1)).getChargingPortsByStatus(status);
    }

    @Test
    void getChargingPortsByStatus_shouldReturn400_whenInvalidStatus() throws Exception {
        // When using standaloneSetup, if a path variable enum conversion fails,
        // it results in a 400 Bad Request directly from Spring's default error handling.
        mockMvc.perform(get("/apiV1/chargingports/status/{status}", "INVALID_STATUS")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(chargingPortService, never()).getChargingPortsByStatus(any(ChargingPortStatus.class));
    }

    // --- DELETE /apiV1/chargingports/{portId} ---
    @Test
    void deleteChargingPort_shouldReturn204_whenDeletionSuccessful() throws Exception {
        Long portId = 1L;
        doNothing().when(chargingPortService).deleteChargingPort(portId);

        mockMvc.perform(delete("/apiV1/chargingports/{portId}", portId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(chargingPortService, times(1)).deleteChargingPort(portId);
    }

    @Test
    void deleteChargingPort_shouldReturn404_whenPortNotFound() throws Exception {
        Long portId = 99L;
        doThrow(new EntityNotFoundException("Port not found")).when(chargingPortService).deleteChargingPort(portId);

        mockMvc.perform(delete("/apiV1/chargingports/{portId}", portId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(chargingPortService, times(1)).deleteChargingPort(portId);
    }

    // --- GET /apiV1/chargingports/station/{stationId}/stats/energy ---
    @Test
    void getTotalEnergyUsed_shouldReturnTotalEnergy_whenStationExists() throws Exception {
        Long stationId = 10L;
        Double totalEnergy = 350.5;
        when(chargingPortService.getTotalEnergyUsedByStation(stationId)).thenReturn(totalEnergy);

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}/stats/energy", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEnergyUsed").value(totalEnergy));

        verify(chargingPortService, times(1)).getTotalEnergyUsedByStation(stationId);
    }

    @Test
    void getTotalEnergyUsed_shouldReturn404_whenStationNotFound() throws Exception {
        Long stationId = 99L;
        when(chargingPortService.getTotalEnergyUsedByStation(stationId)).thenThrow(new EntityNotFoundException("Station not found"));

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}/stats/energy", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(chargingPortService, times(1)).getTotalEnergyUsedByStation(stationId);
    }

    // --- POST /apiV1/chargingports/station/{stationId} ---
    @Test
    void createChargingPort_shouldReturn201_whenPortCreatedSuccessfully() throws Exception {
        Long stationId = 10L;
        ChargingPort createdPort = new ChargingPort();
        createdPort.setId(3L);
        createdPort.setPortIdentifier(testPortRequest.getPortIdentifier());
        createdPort.setStatus(testPortRequest.getStatus());
        createdPort.setEnergyUsed(testPortRequest.getEnergyUsed());
        createdPort.setStationId(stationId); // Important: The service will set this if not already set

        when(chargingPortService.createChargingPort(eq(stationId), any(ChargingPort.class))).thenReturn(createdPort);

        mockMvc.perform(post("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPortRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(createdPort.getId()))
                .andExpect(jsonPath("$.portIdentifier").value(createdPort.getPortIdentifier()))
                .andExpect(jsonPath("$.status").value(createdPort.getStatus().name()))
                .andExpect(jsonPath("$.energyUsed").value(createdPort.getEnergyUsed()));

        verify(chargingPortService, times(1)).createChargingPort(eq(stationId), any(ChargingPort.class));
    }

    @Test
    void createChargingPort_shouldReturn400_whenInvalidRequestData() throws Exception {
        Long stationId = 10L;
        // Create an invalid request. For example, if @NotBlank was on portIdentifier in ChargingPortRequest
        ChargingPortRequest invalidRequest = new ChargingPortRequest();
        invalidRequest.setPortIdentifier(null); // Assuming @NotBlank is on this field
        invalidRequest.setStatus(null); // Assuming @NotNull or @NotBlank on status
        invalidRequest.setEnergyUsed(-5.0); // Assuming @Positive on energyUsed

        mockMvc.perform(post("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(chargingPortService, never()).createChargingPort(anyLong(), any(ChargingPort.class));
    }

    @Test
    void createChargingPort_shouldReturn404_whenStationNotFound() throws Exception {
        Long stationId = 99L;
        when(chargingPortService.createChargingPort(eq(stationId), any(ChargingPort.class)))
                .thenThrow(new EntityNotFoundException("Station not found"));

        mockMvc.perform(post("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPortRequest)))
                .andExpect(status().isNotFound());

        verify(chargingPortService, times(1)).createChargingPort(eq(stationId), any(ChargingPort.class));
    }
}