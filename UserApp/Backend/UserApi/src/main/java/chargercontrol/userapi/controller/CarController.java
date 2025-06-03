package chargercontrol.userapi.controller;

import chargercontrol.userapi.jwt.JwtUtil;
import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.service.CarService;
import chargercontrol.userapi.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apiV1/cars")
@Tag(name = "Cars", description = "APIs for managing cars")
public class CarController {

    private final CarService carService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping("/user/{jwtToken}/add")
    @Operation(summary = "Add a new car to a user", responses = {
            @ApiResponse(responseCode = "201", description = "Car added successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Car.class))),
            @ApiResponse(responseCode = "400", description = "Invalid token or car data")
    })
    public ResponseEntity<Car> addCarToUser(
            @PathVariable String jwtToken,
            @Valid @RequestBody Car car) {
        try {
            // Remove "Bearer " prefix if present
            if (jwtToken.startsWith("Bearer ")) {
                jwtToken = jwtToken.substring(7);
            }

            String email = jwtUtil.extractEmail(jwtToken);
            User user = userService.getUserByEmail(email);
            Car newCar = carService.addCarToUser(user.getId(), car);

            return new ResponseEntity<>(newCar, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/user/{jwtToken}")
    @Operation(summary = "Get all cars for the authenticated user", responses = {
            @ApiResponse(responseCode = "200", description = "Cars retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Car.class))),
            @ApiResponse(responseCode = "400", description = "Invalid token or user not found")
    })
    public ResponseEntity<List<Car>> getCarsByUserId(@PathVariable String jwtToken) {
        try {

            if (jwtToken.startsWith("Bearer ")) {
                jwtToken = jwtToken.substring(7);
            }

            String email = jwtUtil.extractEmail(jwtToken);
            User user = userService.getUserByEmail(email);
            List<Car> cars = carService.getCarsByUserId(user.getId());

            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    @GetMapping("/{carId}")
    @Operation(summary = "Get a car by its ID", responses = {
            @ApiResponse(responseCode = "200", description = "Car retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Car.class))),
            @ApiResponse(responseCode = "404", description = "Car not found")
    })
    public ResponseEntity<Car> getCarById(
            @Parameter(description = "ID of the car to retrieve") @PathVariable Long carId) {
        Car car = carService.getCarById(carId);
        return ResponseEntity.ok(car);
    }

    @PutMapping("/{carId}")
    @Operation(summary = "Update an existing car", responses = {
            @ApiResponse(responseCode = "200", description = "Car updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Car.class))),
            @ApiResponse(responseCode = "400", description = "Invalid car data"),
            @ApiResponse(responseCode = "404", description = "Car not found")
    })
    public ResponseEntity<Car> updateCar(
            @Parameter(description = "ID of the car to update") @PathVariable Long carId,
            @Valid @RequestBody Car carDetails) {
        Car updatedCar = carService.updateCar(carId, carDetails);
        return ResponseEntity.ok(updatedCar);
    }

    @DeleteMapping("/{carId}")
    @Operation(summary = "Delete a car by its ID", responses = {
            @ApiResponse(responseCode = "204", description = "Car deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Car not found")
    })
    public ResponseEntity<Void> deleteCar(
            @Parameter(description = "ID of the car to delete") @PathVariable Long carId) {
        carService.deleteCar(carId);
        return ResponseEntity.noContent().build();
    }
}
