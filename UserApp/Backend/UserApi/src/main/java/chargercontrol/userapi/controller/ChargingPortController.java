package chargercontrol.userapi.controller;

import chargercontrol.userapi.model.ChargingPortCreateRequest;
import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.service.ChargingPortService;
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

@RestController
@RequestMapping("/apiV1/chargingports")
@Tag(name = "Charging Ports", description = "APIs for managing charging ports")
public class ChargingPortController {

    private final ChargingPortService chargingPortService;

    public ChargingPortController(ChargingPortService chargingPortService) {
        this.chargingPortService = chargingPortService;
    }

    @PostMapping("/station/{stationId}")
    @Operation(summary = "Create a new charging port for a station", responses = {
            @ApiResponse(responseCode = "201", description = "Charging port created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "400", description = "Invalid charging port data"),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<ChargingPort> createChargingPort(
            @Parameter(description = "ID of the station to add the charging port to") @PathVariable Long stationId,
            @Valid @RequestBody ChargingPortCreateRequest request) {
        ChargingPort chargingPort = new ChargingPort();
        chargingPort.setPortIdentifier(request.getPortIdentifier());
        chargingPort.setStatus(request.getStatus());
        chargingPort.setEnergyUsed(request.getEnergyUsed());
        ChargingPort newPort = chargingPortService.createChargingPort(stationId, chargingPort);
        return new ResponseEntity<>(newPort, HttpStatus.CREATED);
    }

    @GetMapping("/{portId}")
    @Operation(summary = "Get a charging port by its ID", responses = {
            @ApiResponse(responseCode = "200", description = "Charging port retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "404", description = "Charging port not found")
    })
    public ResponseEntity<ChargingPort> getChargingPortById(
            @Parameter(description = "ID of the charging port to retrieve") @PathVariable Long portId) {
        ChargingPort port = chargingPortService.getChargingPortById(portId);
        return ResponseEntity.ok(port);
    }

    @GetMapping("/station/{stationId}")
    @Operation(summary = "Get all charging ports for a station", responses = {
            @ApiResponse(responseCode = "200", description = "Charging ports retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<List<ChargingPort>> getChargingPortsByStationId(
            @Parameter(description = "ID of the station whose charging ports to retrieve") @PathVariable Long stationId) {
        List<ChargingPort> ports = chargingPortService.getChargingPortsByStationId(stationId);
        return ResponseEntity.ok(ports);
    }

    @GetMapping("/station/{stationId}/status/{status}")
    @Operation(summary = "Get charging ports for a station by status", responses = {
            @ApiResponse(responseCode = "200", description = "Charging ports retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status value"),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<List<ChargingPort>> getChargingPortsByStationIdAndStatus(
            @Parameter(description = "ID of the station") @PathVariable Long stationId,
            @Parameter(description = "Status of the charging ports to retrieve") @PathVariable ChargingPortStatus status) {
        List<ChargingPort> ports = chargingPortService.getChargingPortsByStationIdAndStatus(stationId, status);
        return ResponseEntity.ok(ports);
    }

    @PutMapping("/{portId}/status")
    @Operation(summary = "Update the status of a charging port", responses = {
            @ApiResponse(responseCode = "200", description = "Charging port status updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status value"),
            @ApiResponse(responseCode = "404", description = "Charging port not found")
    })
    public ResponseEntity<ChargingPort> updateChargingPortStatus(
            @Parameter(description = "ID of the charging port to update") @PathVariable Long portId,
            @Parameter(description = "New status for the charging port") @RequestBody ChargingPortStatus status) {
        ChargingPort updatedPort = chargingPortService.updateChargingPortStatus(portId, status);
        return ResponseEntity.ok(updatedPort);
    }

    @PutMapping("/{portId}")
    @Operation(summary = "Update an existing charging port", responses = {
            @ApiResponse(responseCode = "200", description = "Charging port updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChargingPort.class))),
            @ApiResponse(responseCode = "400", description = "Invalid charging port data"),
            @ApiResponse(responseCode = "404", description = "Charging port not found")
    })
    public ResponseEntity<ChargingPort> updateChargingPort(
            @Parameter(description = "ID of the charging port to update") @PathVariable Long portId,
            @Valid @RequestBody ChargingPort portDetails) {
        ChargingPort updatedPort = chargingPortService.updateChargingPort(portId, portDetails);
        return ResponseEntity.ok(updatedPort);
    }

    @DeleteMapping("/{portId}")
    @Operation(summary = "Delete a charging port by its ID", responses = {
            @ApiResponse(responseCode = "204", description = "Charging port deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Charging port not found")
    })
    public ResponseEntity<Void> deleteChargingPort(
            @Parameter(description = "ID of the charging port to delete") @PathVariable Long portId) {
        chargingPortService.deleteChargingPort(portId);
        return ResponseEntity.noContent().build();
    }
}
