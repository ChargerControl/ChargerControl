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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.StationRepository;
import chargercontrol.userapi.service.ChargingPortService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser
@Transactional
class ChargingPortControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChargingPortService chargingPortService;

    @Autowired
    private ChargingPortRepository chargingPortRepository;

    @Autowired
    private StationRepository stationRepository;

    private Station testStation;
    private ChargingPort testPort;

    @BeforeEach
    void setUp() {
        chargingPortRepository.deleteAll();
        stationRepository.deleteAll();
        testStation = new Station();
        testStation.setName("Test Station");
        testStation = stationRepository.save(testStation);

        testPort = new ChargingPort();
        testPort.setStation(testStation);
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);
        testPort.setPortIdentifier("A01");
        testPort = chargingPortRepository.save(testPort);
    }

    @Test
    void createChargingPort_Success() throws Exception {
        // Do not set station, let controller handle it from path variable
        ChargingPort newPort = new ChargingPort();
        newPort.setPortIdentifier("B02");
        newPort.setStatus(ChargingPortStatus.AVAILABLE);
        newPort.setEnergyUsed(0.0);

        mockMvc.perform(post("/apiV1/chargingports/station/{stationId}", testStation.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPort)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.portIdentifier").value("B02"))
                .andExpect(jsonPath("$.status").value(ChargingPortStatus.AVAILABLE.toString()));
    }

    @Test
    void createChargingPort_StationNotFound_Returns404() throws Exception {
        ChargingPort newPort = new ChargingPort();
        newPort.setPortIdentifier("C03");
        newPort.setStatus(ChargingPortStatus.AVAILABLE);
        newPort.setEnergyUsed(0.0);

        mockMvc.perform(post("/apiV1/chargingports/station/{stationId}", 99999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPort)))
                .andExpect(status().isNotFound());
    }

    @Test
    void getChargingPortById_Success() throws Exception {
        mockMvc.perform(get("/apiV1/chargingports/{portId}", testPort.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testPort.getId()))
                .andExpect(jsonPath("$.portIdentifier").value(testPort.getPortIdentifier()));
    }

    @Test
    void getChargingPortById_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/apiV1/chargingports/{portId}", 99999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void getChargingPortsByStationId_Success() throws Exception {
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", testStation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testPort.getId()))
                .andExpect(jsonPath("$[0].portIdentifier").value(testPort.getPortIdentifier()));
    }

    @Test
    void getChargingPortsByStationId_StationNotFound_Returns404() throws Exception {
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", 99999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void getChargingPortsByStationId_EmptyList() throws Exception {
        Station emptyStation = new Station();
        emptyStation.setName("Empty Station");
        emptyStation = stationRepository.save(emptyStation);
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", emptyStation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getChargingPortsByStationIdAndStatus_Success() throws Exception {
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}/status/{status}",
                testStation.getId(), ChargingPortStatus.AVAILABLE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testPort.getId()))
                .andExpect(jsonPath("$[0].status").value(ChargingPortStatus.AVAILABLE.toString()));
    }

    @Test
    void updateChargingPortStatus_Success() throws Exception {
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
