package chargercontrol.operatorapi.controller;

import chargercontrol.operatorapi.controller.ChargingPortController;
import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import chargercontrol.operatorapi.service.ChargingPortService;
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
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChargingPortController Tests")
class ChargingPortControllerTest {

    @Mock
    private ChargingPortService chargingPortService;

    @InjectMocks
    private ChargingPortController chargingPortController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(chargingPortController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Should return charging ports by station ID successfully")
    void getChargingPortsByStationId_Success() throws Exception {
        // Given
        Long stationId = 1L;
        ChargingPort port1 = new ChargingPort();
        port1.setId(1L);
        port1.setStationId(stationId);
        port1.setStatus(ChargingPortStatus.AVAILABLE);

        ChargingPort port2 = new ChargingPort();
        port2.setId(2L);
        port2.setStationId(stationId);
        port2.setStatus(ChargingPortStatus.OCCUPIED);

        List<ChargingPort> ports = Arrays.asList(port1, port2);

        when(chargingPortService.getChargingPortsByStationId(stationId)).thenReturn(ports);

        // When & Then
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].stationId").value(stationId))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].stationId").value(stationId));

        verify(chargingPortService).getChargingPortsByStationId(stationId);
    }

    @Test
    @DisplayName("Should return 404 when station not found")
    void getChargingPortsByStationId_StationNotFound() throws Exception {
        // Given
        Long stationId = 999L;
        when(chargingPortService.getChargingPortsByStationId(stationId))
                .thenThrow(new RuntimeException("Station not found"));

        // When & Then
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(chargingPortService).getChargingPortsByStationId(stationId);
    }

    @Test
    @DisplayName("Should return charging ports by status successfully")
    void getChargingPortsByStatus_Success() throws Exception {
        // Given
        ChargingPortStatus status = ChargingPortStatus.AVAILABLE;
        ChargingPort port1 = new ChargingPort();
        port1.setId(1L);
        port1.setStatus(status);

        ChargingPort port2 = new ChargingPort();
        port2.setId(2L);
        port2.setStatus(status);

        List<ChargingPort> ports = Arrays.asList(port1, port2);

        when(chargingPortService.getChargingPortsByStatus(status)).thenReturn(ports);

        // When & Then
        mockMvc.perform(get("/apiV1/chargingports/status/{status}", status.name())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));

        verify(chargingPortService).getChargingPortsByStatus(status);
    }

    @Test
    @DisplayName("Should return empty list when no ports found by status")
    void getChargingPortsByStatus_EmptyList() throws Exception {
        // Given
        ChargingPortStatus status = ChargingPortStatus.OUT_OF_ORDER;
        when(chargingPortService.getChargingPortsByStatus(status)).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/apiV1/chargingports/status/{status}", status.name())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(0));

        verify(chargingPortService).getChargingPortsByStatus(status);
    }

    @Test
    @DisplayName("Should delete charging port successfully")
    void deleteChargingPort_Success() throws Exception {
        // Given
        Long portId = 1L;
        doNothing().when(chargingPortService).deleteChargingPort(portId);

        // When & Then
        mockMvc.perform(delete("/apiV1/chargingports/{portId}", portId))
                .andExpect(status().isNoContent());

        verify(chargingPortService).deleteChargingPort(portId);
    }

    @Test
    @DisplayName("Should return 404 when trying to delete non-existent charging port")
    void deleteChargingPort_NotFound() throws Exception {
        // Given
        Long portId = 999L;
        doThrow(new RuntimeException("Charging port not found"))
                .when(chargingPortService).deleteChargingPort(portId);

        // When & Then
        mockMvc.perform(delete("/apiV1/chargingports/{portId}", portId))
                .andExpect(status().isNotFound());

        verify(chargingPortService).deleteChargingPort(portId);
    }

    @Test
    @DisplayName("Should return total energy used by station successfully")
    void getTotalEnergyUsed_Success() throws Exception {
        // Given
        Long stationId = 1L;
        Double totalEnergy = 150.5;
        when(chargingPortService.getTotalEnergyUsedByStation(stationId)).thenReturn(totalEnergy);

        // When & Then
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}/stats/energy", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalEnergyUsed").value(150.5));

        verify(chargingPortService).getTotalEnergyUsedByStation(stationId);
    }

    @Test
    @DisplayName("Should return 404 when station not found for energy stats")
    void getTotalEnergyUsed_StationNotFound() throws Exception {
        // Given
        Long stationId = 999L;
        when(chargingPortService.getTotalEnergyUsedByStation(stationId))
                .thenThrow(new RuntimeException("Station not found"));

        // When & Then
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}/stats/energy", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(chargingPortService).getTotalEnergyUsedByStation(stationId);
    }

    @Test
    @DisplayName("Should handle zero energy consumption")
    void getTotalEnergyUsed_ZeroEnergy() throws Exception {
        // Given
        Long stationId = 1L;
        Double totalEnergy = 0.0;
        when(chargingPortService.getTotalEnergyUsedByStation(stationId)).thenReturn(totalEnergy);

        // When & Then
        mockMvc.perform(get("/apiV1/chargingports/station/{stationId}/stats/energy", stationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalEnergyUsed").value(0.0));

        verify(chargingPortService).getTotalEnergyUsedByStation(stationId);
    }
}