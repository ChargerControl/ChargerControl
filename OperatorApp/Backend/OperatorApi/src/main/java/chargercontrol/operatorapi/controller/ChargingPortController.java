package chargercontrol.operatorapi.controller;

import chargercontrol.operatorapi.dto.ChargingPortRequest;
import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import chargercontrol.operatorapi.service.ChargingPortService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/apiV1/chargingports")
@Tag(name = "Charging Ports", description = "APIs for managing charging ports")
public class ChargingPortController {

    private final ChargingPortService chargingPortService;

    public ChargingPortController(ChargingPortService chargingPortService) {
        this.chargingPortService = chargingPortService;
    }

    @GetMapping("/station/{stationId}")
    @Operation(summary = "Get all charging ports for a station", responses = {
            @ApiResponse(responseCode = "200", description = "Charging ports retrieved successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<List<ChargingPort>> getChargingPortsByStationId(
            @Parameter(description = "ID of the station whose charging ports to retrieve") @PathVariable Long stationId) {
        try {
            List<ChargingPort> ports = chargingPortService.getChargingPortsByStationId(stationId);
            return ResponseEntity.ok(ports);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get all charging ports by status", responses = {
            @ApiResponse(responseCode = "200", description = "Charging ports retrieved successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status value")
    })
    public ResponseEntity<List<ChargingPort>> getChargingPortsByStatus(
            @Parameter(description = "Status of the charging ports to retrieve") @PathVariable ChargingPortStatus status) {
        List<ChargingPort> ports = chargingPortService.getChargingPortsByStatus(status);
        return ResponseEntity.ok(ports);
    }

    @DeleteMapping("/{portId}")
    @Operation(summary = "Delete a charging port by its ID", responses = {
            @ApiResponse(responseCode = "204", description = "Charging port deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Charging port not found")
    })
    public ResponseEntity<Void> deleteChargingPort(
            @Parameter(description = "ID of the charging port to delete") @PathVariable Long portId) {
        try {
            chargingPortService.deleteChargingPort(portId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/station/{stationId}/stats/energy")
    @Operation(summary = "Get total energy used by all charging ports for a station", responses = {
            @ApiResponse(responseCode = "200", description = "Total energy retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<Map<String, Double>> getTotalEnergyUsed(
            @Parameter(description = "ID of the station") @PathVariable Long stationId) {
        try {
            Double totalEnergy = chargingPortService.getTotalEnergyUsedByStation(stationId);
            return ResponseEntity.ok(Map.of("totalEnergyUsed", totalEnergy));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/station/{stationId}")
        @Operation(summary = "Create a new charging port for a station", responses = {
                @ApiResponse(responseCode = "201", description = "Charging port created successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
                @ApiResponse(responseCode = "400", description = "Invalid charging port data"),
                @ApiResponse(responseCode = "404", description = "Station not found")
        })
        public ResponseEntity<ChargingPort> createChargingPort(
                @Parameter(description = "ID of the station to add the charging port to") @PathVariable Long stationId,
                @Valid @RequestBody ChargingPortRequest chargingPortRequest) {

        ChargingPort chargingPort = new ChargingPort();
        chargingPort.setPortIdentifier(chargingPortRequest.getPortIdentifier());
        chargingPort.setStatus(chargingPortRequest.getStatus());
        chargingPort.setEnergyUsed(chargingPortRequest.getEnergyUsed());

        ChargingPort newPort = chargingPortService.createChargingPort(stationId, chargingPort);
        return new ResponseEntity<>(newPort, HttpStatus.CREATED);
        }
}