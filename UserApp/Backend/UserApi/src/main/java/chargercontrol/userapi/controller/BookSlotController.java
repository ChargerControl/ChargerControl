package chargercontrol.userapi.controller;

import chargercontrol.userapi.jwt.JwtUtil;
import chargercontrol.userapi.model.*;
import chargercontrol.userapi.service.BookSlotService;
import chargercontrol.userapi.service.StationService;
import chargercontrol.userapi.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;



@RestController
@RequestMapping("/apiV1/bookings")
@Tag(name = "Bookings", description = "APIs for managing bookings")
public class BookSlotController {

    @Autowired
    private JwtUtil jwtUtil;

    private static final Logger logger = LoggerFactory.getLogger(BookSlotController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private StationService stationService;

    private final BookSlotService bookSlotService;

    public BookSlotController(BookSlotService bookSlotService) {
        this.bookSlotService = bookSlotService;
    }


    @PostMapping
    @Transactional
    @Operation(summary = "Create a new booking", responses = {
            @ApiResponse(responseCode = "201", description = "Booking created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookSlot.class))),
            @ApiResponse(responseCode = "400", description = "Invalid booking data")
    })
    public ResponseEntity<BookSlot> createBooking(@Valid @RequestBody BookRequest bookRequest) {
        try {
            String email = jwtUtil.extractEmail(bookRequest.getJwtToken());
            User user = userService.getUserByEmail(email);

            Station station = stationService.getStationById(bookRequest.getStationId())
                    .orElseThrow(() -> new RuntimeException("Station not found with id: " + bookRequest.getStationId()));

            // Find an available slot in any of the charging ports
            ChargingPort availablePort = station.getChargingPorts().stream()
                    .filter(port -> port.getStatus() == ChargingPortStatus.AVAILABLE)
                    .filter(port -> isSlotAvailable(port, bookRequest.getStartTime(), bookRequest.getDuration()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No available slots at this station for the requested time"));

            // Get the car from the request
            Car car = user.getCars().stream()
                    .filter(c -> c.getId().equals(bookRequest.getCarId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Car not found with id: " + bookRequest.getCarId()));

            // Create the booking object
            BookSlot bookSlot = new BookSlot();
            bookSlot.setUser(user);
            bookSlot.setChargingPort(availablePort);
            bookSlot.setCar(car);
            bookSlot.setBookingTime(bookRequest.getStartTime());
            bookSlot.setDuration(bookRequest.getDuration());
            bookSlot.setStatus(BookingStatus.PENDING);

            // Save the booking
            BookSlot newBooking = bookSlotService.createBooking(bookSlot);

            return new ResponseEntity<>(newBooking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            logger.error("Booking creation failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Helper method to check if a slot is available
    private boolean isSlotAvailable(ChargingPort port, LocalDateTime startTime, Integer duration) {
        LocalDateTime endTime = startTime.plusMinutes(duration);
        List<BookSlot> overlappingBookings = bookSlotService.getBookingsByChargingPortIdAndTimeRange(
                port.getId(), startTime, endTime);
        return overlappingBookings.isEmpty();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Booking found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookSlot.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookSlot> getBookingById(
            @Parameter(description = "ID of the booking to retrieve") @PathVariable Long id) {
        return bookSlotService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get bookings by user ID", responses = {
            @ApiResponse(responseCode = "200", description = "Bookings found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookSlot.class)))
    })
    public ResponseEntity<List<BookSlot>> getBookingsByUserId(
            @Parameter(description = "ID of the user whose bookings to retrieve") @PathVariable Long userId) {
        List<BookSlot> bookings = bookSlotService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/station/{chargingPortId}")
    @Operation(summary = "Get bookings by station ID", responses = {
            @ApiResponse(responseCode = "200", description = "Bookings found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookSlot.class)))
    })
    public ResponseEntity<List<BookSlot>> getBookingsByStationId(
            @Parameter(description = "ID of the station whose bookings to retrieve") @PathVariable Long chargingPortId) {
        List<BookSlot> bookings = bookSlotService.getBookingsByChargingPortId(chargingPortId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/station/{chargingPortId}/range")
    @Operation(summary = "Get bookings by station ID and time range", responses = {
            @ApiResponse(responseCode = "200", description = "Bookings found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookSlot.class)))
    })
    public ResponseEntity<List<BookSlot>> getBookingsByStationIdAndRange(
            @Parameter(description = "ID of the station whose bookings to retrieve") @PathVariable Long chargingPortId,
            @Parameter(description = "Start time for the booking range (ISO DATE_TIME format)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "End time for the booking range (ISO DATE_TIME format)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<BookSlot> bookings = bookSlotService.getBookingsByChargingPortIdAndTimeRange(chargingPortId, startTime,
                endTime);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update booking status", responses = {
            @ApiResponse(responseCode = "200", description = "Booking status updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookSlot.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookSlot> updateBookingStatus(
            @Parameter(description = "ID of the booking to update") @PathVariable Long id,
            @Parameter(description = "New status for the booking") @RequestBody BookingStatus status) {
        try {
            BookSlot updatedBooking = bookSlotService.updateBookingStatus(id, status);
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a booking", responses = {
            @ApiResponse(responseCode = "204", description = "Booking cancelled successfully"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<Void> cancelBooking(
            @Parameter(description = "ID of the booking to cancel") @PathVariable Long id) {
        try {
            bookSlotService.cancelBooking(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
