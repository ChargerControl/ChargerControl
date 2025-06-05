package chargercontrol.userapi.controller;

import chargercontrol.userapi.dto.CarResponseDTO;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/apiV1/cars")
@Tag(name = "Cars", description = "APIs for managing cars")
public class CarController {

    private static final Logger logger = LoggerFactory.getLogger(CarController.class);
    
    private final CarService carService;

    @Autowired
    private UserService userService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping("/user/{userId}")
    @Operation(summary = "Add a new car to a user", 
              description = "Create a new car and associate it with the specified user",
              responses = {
                  @ApiResponse(responseCode = "201", 
                             description = "Car added successfully", 
                             content = @Content(mediaType = "application/json", 
                                             schema = @Schema(implementation = CarResponseDTO.class))),
                  @ApiResponse(responseCode = "400", 
                             description = "Invalid car data"),
                  @ApiResponse(responseCode = "404", 
                             description = "User not found")
              })
    public ResponseEntity<CarResponseDTO> addCarToUser(
            @Parameter(description = "ID of the user to add the car to") 
            @PathVariable Long userId,
            @Valid @RequestBody Car car) {
        try {
            // Verificar se o usuário existe
            User user = userService.getUserById(userId);
            
            // Adicionar o carro ao usuário
            Car newCar = carService.addCarToUser(userId, car);
            
            // Convert to DTO to avoid lazy loading issues
            CarResponseDTO carDTO = new CarResponseDTO(newCar);
            
            return new ResponseEntity<>(carDTO, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            logger.error("Error adding car to user {}: {}", userId, e.getMessage());
            if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            logger.error("Unexpected error adding car to user {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all cars for a specific user", 
              description = "Retrieve all cars associated with the specified user",
              responses = {
                  @ApiResponse(responseCode = "200", 
                             description = "Cars retrieved successfully", 
                             content = @Content(mediaType = "application/json", 
                                             schema = @Schema(implementation = CarResponseDTO.class))),
                  @ApiResponse(responseCode = "404", 
                             description = "User not found")
              })
    public ResponseEntity<List<CarResponseDTO>> getCarsByUserId(
            @Parameter(description = "ID of the user to get cars for") 
            @PathVariable Long userId) {
        try {
            // Verificar se o usuário existe
            User user = userService.getUserById(userId);
            
            // Buscar carros do usuário
            List<Car> cars = carService.getCarsByUserId(userId);
            
            // Convert to DTOs
            List<CarResponseDTO> carDTOs = cars.stream()
                    .map(CarResponseDTO::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(carDTOs);
        } catch (RuntimeException e) {
            logger.error("Error retrieving cars for user {}: {}", userId, e.getMessage());
            if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ArrayList<>());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ArrayList<>());
        } catch (Exception e) {
            logger.error("Unexpected error retrieving cars for user {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @GetMapping("/all")
    @Operation(summary = "Get all cars", 
              description = "Retrieve all cars in the system",
              responses = {
                  @ApiResponse(responseCode = "200", 
                             description = "Cars retrieved successfully", 
                             content = @Content(mediaType = "application/json", 
                                             schema = @Schema(implementation = CarResponseDTO.class))),
                  @ApiResponse(responseCode = "500", 
                             description = "Internal server error")
              })
    public ResponseEntity<List<CarResponseDTO>> getAllCars() {
        try {
            List<Car> cars = carService.getAllCars();
            List<CarResponseDTO> carDTOs = cars.stream()
                    .map(CarResponseDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(carDTOs);
        } catch (Exception e) {
            logger.error("Error retrieving all cars", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>());
        }
    }

    @GetMapping("/{carId}")
    @Operation(summary = "Get a car by its ID", 
              responses = {
                  @ApiResponse(responseCode = "200", 
                             description = "Car retrieved successfully", 
                             content = @Content(mediaType = "application/json", 
                                             schema = @Schema(implementation = CarResponseDTO.class))),
                  @ApiResponse(responseCode = "404", 
                             description = "Car not found")
              })
    public ResponseEntity<CarResponseDTO> getCarById(
            @Parameter(description = "ID of the car to retrieve") 
            @PathVariable Long carId) {
        try {
            Car car = carService.getCarById(carId);
            CarResponseDTO carDTO = new CarResponseDTO(car);
            return ResponseEntity.ok(carDTO);
        } catch (RuntimeException e) {
            logger.error("Error retrieving car {}: {}", carId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            logger.error("Unexpected error retrieving car {}", carId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{carId}")
    @Operation(summary = "Update an existing car", 
              responses = {
                  @ApiResponse(responseCode = "200", 
                             description = "Car updated successfully", 
                             content = @Content(mediaType = "application/json", 
                                             schema = @Schema(implementation = CarResponseDTO.class))),
                  @ApiResponse(responseCode = "400", 
                             description = "Invalid car data"),
                  @ApiResponse(responseCode = "404", 
                             description = "Car not found")
              })
    public ResponseEntity<CarResponseDTO> updateCar(
            @Parameter(description = "ID of the car to update") 
            @PathVariable Long carId,
            @Valid @RequestBody Car carDetails) {
        try {
            Car updatedCar = carService.updateCar(carId, carDetails);
            CarResponseDTO carDTO = new CarResponseDTO(updatedCar);
            return ResponseEntity.ok(carDTO);
        } catch (RuntimeException e) {
            logger.error("Error updating car {}: {}", carId, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            logger.error("Unexpected error updating car {}", carId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{carId}")
    @Operation(summary = "Delete a car by its ID", 
              responses = {
                  @ApiResponse(responseCode = "204", 
                             description = "Car deleted successfully"),
                  @ApiResponse(responseCode = "404", 
                             description = "Car not found")
              })
    public ResponseEntity<Void> deleteCar(
            @Parameter(description = "ID of the car to delete") 
            @PathVariable Long carId) {
        try {
            carService.deleteCar(carId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting car {}: {}", carId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error deleting car {}", carId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}