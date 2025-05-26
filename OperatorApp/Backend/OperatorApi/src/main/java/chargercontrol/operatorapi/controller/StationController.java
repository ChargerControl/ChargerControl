package chargercontrol.operatorapi.controller;

import chargercontrol.operatorapi.model.Station;
import chargercontrol.operatorapi.service.StationService;
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

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/apiV1/stations")
@Tag(name = "Stations", description = "APIs for managing charging stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @PostMapping
    @Operation(summary = "Create a new charging station", responses = {
            @ApiResponse(responseCode = "201", description = "Station created successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class))),
            @ApiResponse(responseCode = "400", description = "Invalid station data")
    })
    public ResponseEntity<Station> createStation(@Valid @RequestBody Station station) {
        Station newStation = stationService.saveStation(station);
        return new ResponseEntity<>(newStation, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all charging stations", responses = {
            @ApiResponse(responseCode = "200", description = "Stations retrieved successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class)))
    })
    public ResponseEntity<List<Station>> getAllStations() {
        List<Station> stations = stationService.getAllStations();
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/available/{available}")
    @Operation(summary = "Get stations by availability status", responses = {
            @ApiResponse(responseCode = "200", description = "Stations retrieved successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class)))
    })
    public ResponseEntity<List<Station>> getStationsByAvailability(
            @Parameter(description = "Availability status (true/false)") @PathVariable Boolean available) {
        List<Station> stations = stationService.getStationsByAvailability(available);
        return ResponseEntity.ok(stations);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a station by ID", responses = {
            @ApiResponse(responseCode = "204", description = "Station deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<Void> deleteStation(
            @Parameter(description = "ID of the station to delete") @PathVariable Long id) {
        try {
            stationService.deleteStation(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}