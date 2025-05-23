package chargercontrol.operatorapi.controller;

import chargercontrol.operatorapi.model.ChargingType;
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
import java.util.Map;

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

    @GetMapping("/{id}")
    @Operation(summary = "Get station by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Station found", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class))),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<Station> getStationById(
            @Parameter(description = "ID of the station to retrieve") @PathVariable Long id) {
        return stationService.getStationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get station by name", responses = {
            @ApiResponse(responseCode = "200", description = "Station found", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class))),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<Station> getStationByName(
            @Parameter(description = "Name of the station to retrieve") @PathVariable String name) {
        return stationService.getStationByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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

    @GetMapping("/charging-type/{chargingType}")
    @Operation(summary = "Get stations by charging type", responses = {
            @ApiResponse(responseCode = "200", description = "Stations retrieved successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class))),
            @ApiResponse(responseCode = "400", description = "Invalid charging type")
    })
    public ResponseEntity<List<Station>> getStationsByChargingType(
            @Parameter(description = "Type of charging") @PathVariable ChargingType chargingType) {
        List<Station> stations = stationService.getStationsByChargingType(chargingType);
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/location/{location}")
    @Operation(summary = "Get stations by location (partial match)", responses = {
            @ApiResponse(responseCode = "200", description = "Stations retrieved successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class)))
    })
    public ResponseEntity<List<Station>> getStationsByLocation(
            @Parameter(description = "Location to search for") @PathVariable String location) {
        List<Station> stations = stationService.getStationsByLocation(location);
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/near")
    @Operation(summary = "Get stations near coordinates", responses = {
            @ApiResponse(responseCode = "200", description = "Stations retrieved successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class))),
            @ApiResponse(responseCode = "400", description = "Invalid coordinates or radius")
    })
    public ResponseEntity<List<Station>> getStationsNearCoordinates(
            @Parameter(description = "Latitude") @RequestParam Double latitude,
            @Parameter(description = "Longitude") @RequestParam Double longitude,
            @Parameter(description = "Radius in kilometers") @RequestParam(defaultValue = "10.0") Double radiusKm) {
        List<Station> stations = stationService.getStationsNearCoordinates(latitude, longitude, radiusKm);
        return ResponseEntity.ok(stations);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing station", responses = {
            @ApiResponse(responseCode = "200", description = "Station updated successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class))),
            @ApiResponse(responseCode = "400", description = "Invalid station data"),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<Station> updateStation(
            @Parameter(description = "ID of the station to update") @PathVariable Long id,
            @Valid @RequestBody Station stationDetails) {
        try {
            Station updatedStation = stationService.updateStation(id, stationDetails);
            return ResponseEntity.ok(updatedStation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/availability")
    @Operation(summary = "Update station availability status", responses = {
            @ApiResponse(responseCode = "200", description = "Station availability updated successfully", 
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = Station.class))),
            @ApiResponse(responseCode = "404", description = "Station not found")
    })
    public ResponseEntity<Station> updateStationAvailability(
            @Parameter(description = "ID of the station to update") @PathVariable Long id,
            @RequestBody Map<String, Boolean> availabilityUpdate) {
        try {
            Boolean available = availabilityUpdate.get("available");
            if (available == null) {
                return ResponseEntity.badRequest().build();
            }
            Station updatedStation = stationService.updateStationAvailability(id, available);
            return ResponseEntity.ok(updatedStation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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