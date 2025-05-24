package chargercontrol.userapi.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.StationRepository;
import chargercontrol.userapi.service.ChargingPortService;
import jakarta.persistence.EntityNotFoundException;

@WebMvcTest(ChargingPortController.class)
class ChargingPortControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChargingPortService chargingPortService;

    @MockBean
    private ChargingPortRepository chargingPortRepository;

    @MockBean
    private StationRepository stationRepository;

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
    void createChargingPort_Success() throws Exception {
        when(chargingPortService.createChargingPort(eq(testStation.getId()), any(ChargingPort.class)))
            .thenReturn(testPort);

        mockMvc.perform(post("/apiV1/chargingports/station/{stationId}", testStation.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPort)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(testPort.getId()))
                .andExpect(jsonPath("$.portIdentifier").value(testPort.getPortIdentifier()))
                .andExpect(jsonPath("$.status").value(testPort.getStatus().toString()));
    }

    @Test
    void createChargingPort_StationNotFound_Returns404() throws Exception {
        when(chargingPortService.createChargingPort(eq(999L), any(ChargingPort.class)))
            .thenThrow(new EntityNotFoundException("Station not found"));

        mockMvc.perform(post("/apiV1/chargingports/station/{stationId}", 999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPort)))
                .andExpect(status().isNotFound());
    }

    @Test
    void getChargingPortById_Success() throws Exception {
        when(chargingPortService.getChargingPortById(testPort.getId()))
            .thenReturn(testPort);

        mockMvc.perform(get("/apiV1/chargingports/{portId}", testPort.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testPort.getId()))
                .andExpect(jsonPath("$.portIdentifier").value(testPort.getPortIdentifier()));
    }

    @Test
    void getChargingPortById_NotFound_Returns404() throws Exception {
        when(chargingPortService.getChargingPortById(999L))
            .thenThrow(new EntityNotFoundException("Charging port not found"));

        mockMvc.perform(get("/apiV1/chargingports/{portId}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void getChargingPortsByStationId_Success() throws Exception {
        when(chargingPortService.getChargingPortsByStationId(testStation.getId()))
            .thenReturn(Arrays.asList(testPort));

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", testStation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testPort.getId()))
                .andExpect(jsonPath("$[0].portIdentifier").value(testPort.getPortIdentifier()));
    }

    @Test
    void getChargingPortsByStationId_EmptyList() throws Exception {
        when(chargingPortService.getChargingPortsByStationId(testStation.getId()))
            .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", testStation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getChargingPortsByStationIdAndStatus_Success() throws Exception {
        when(chargingPortService.getChargingPortsByStationIdAndStatus(
                eq(testStation.getId()), eq(ChargingPortStatus.AVAILABLE)))
            .thenReturn(Arrays.asList(testPort));

        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}/status/{status}",
                testStation.getId(), ChargingPortStatus.AVAILABLE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testPort.getId()))
                .andExpect(jsonPath("$[0].status").value(ChargingPortStatus.AVAILABLE.toString()));
    }

    @Test
    void updateChargingPortStatus_Success() throws Exception {
        ChargingPort updatedPort = new ChargingPort();
        updatedPort.setId(testPort.getId());
        updatedPort.setStation(testStation);
        updatedPort.setStatus(ChargingPortStatus.CHARGING);
        updatedPort.setPortIdentifier(testPort.getPortIdentifier());

        when(chargingPortService.updateChargingPortStatus(
                eq(testPort.getId()), eq(ChargingPortStatus.CHARGING)))
            .thenReturn(updatedPort);

        mockMvc.perform(put("/apiV1/chargingports/{portId}/status", testPort.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"CHARGING\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(ChargingPortStatus.CHARGING.toString()));
    }

    @Test
    void updateChargingPortStatus_InvalidStatus_Returns400() throws Exception {
        mockMvc.perform(put("/apiV1/chargingports/{portId}/status", testPort.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"INVALID_STATUS\""))
                .andExpect(status().isBadRequest());
    }
}
