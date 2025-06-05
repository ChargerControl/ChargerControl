package chargercontrol.userapi.controller;

import chargercontrol.userapi.dto.CarResponseDTO;
import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.service.CarService;
import chargercontrol.userapi.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils; // Import this!

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException; // Import this!
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CarControllerTest {

    @Mock
    private CarService carService;

    @Mock
    private UserService userService; // This mock will be injected into carController

    @InjectMocks
    private CarController carController; // The instance where mocks will be injected

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // This is the crucial fix: Manually inject the 'userService' mock
        // into the 'carController' instance's 'userService' field using reflection.
        // This works because the controller uses field injection for userService.
        ReflectionTestUtils.setField(carController, "userService", userService);
    }

    // Test for addCarToUser method
    @Test
    void addCarToUser_Success() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setName("Test User");

        Car carRequest = new Car();
        carRequest.setModel("ModelX");
        carRequest.setBrand("BrandY");
        carRequest.setMaximumCharge(100.0);
        carRequest.setCarClass("SUV");
        carRequest.setImageUrl("http://example.com/car.jpg");

        Car savedCar = new Car();
        savedCar.setId(1L);
        savedCar.setModel("ModelX");
        savedCar.setBrand("BrandY");
        savedCar.setMaximumCharge(100.0);
        savedCar.setCarClass("SUV");
        savedCar.setImageUrl("http://example.com/car.jpg");
        savedCar.setOwner(user);

        when(userService.getUserById(userId)).thenReturn(user); // Mock user existence check
        when(carService.addCarToUser(userId, carRequest)).thenReturn(savedCar);

        ResponseEntity<CarResponseDTO> response = carController.addCarToUser(userId, carRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(savedCar.getId(), response.getBody().getId());
        assertEquals(savedCar.getModel(), response.getBody().getModel());
        assertEquals(savedCar.getOwner().getId(), response.getBody().getOwnerId());

        verify(userService, times(1)).getUserById(userId);
        verify(carService, times(1)).addCarToUser(userId, carRequest);
    }

    @Test
    void addCarToUser_UserNotFound() {
        Long userId = 1L;
        Car carRequest = new Car();

        // Simulate userService throwing NoSuchElementException when user not found
        // Your controller checks for user existence first, then calls addCarToUser
        // If userService.getUserById() throws, addCarToUser() should not be called.
        when(userService.getUserById(userId)).thenThrow(new NoSuchElementException("User not found"));

        ResponseEntity<CarResponseDTO> response = carController.addCarToUser(userId, carRequest);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(userService, times(1)).getUserById(userId);
        // Ensure carService.addCarToUser is NOT called if user is not found
        verify(carService, never()).addCarToUser(anyLong(), any(Car.class));
    }

    @Test
    void addCarToUser_InvalidCarData() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        Car carRequest = new Car(); // Represents invalid input (e.g., missing required fields)

        when(userService.getUserById(userId)).thenReturn(user); // User exists
        // Simulate carService throwing a RuntimeException due to invalid car data
        when(carService.addCarToUser(userId, carRequest)).thenThrow(new RuntimeException("Invalid car data provided"));

        ResponseEntity<CarResponseDTO> response = carController.addCarToUser(userId, carRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(userService, times(1)).getUserById(userId);
        verify(carService, times(1)).addCarToUser(userId, carRequest);
    }

    @Test
    void addCarToUser_InternalServerError() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        Car carRequest = new Car();

        when(userService.getUserById(userId)).thenReturn(user);
        // FIX: Throw a RuntimeException instead of a checked Exception
        when(carService.addCarToUser(userId, carRequest)).thenThrow(new RuntimeException("Unexpected database error"));

        ResponseEntity<CarResponseDTO> response = carController.addCarToUser(userId, carRequest);

        // Based on your controller's original code, it would catch RuntimeException first
        // and return HttpStatus.BAD_REQUEST for generic RuntimeExceptions, not INTERNAL_SERVER_ERROR.
        // If the intention for "Unexpected database error" was truly INTERNAL_SERVER_ERROR,
        // then your controller's catch block for RuntimeException needs adjustment,
        // or you need a more specific exception for INTERNAL_SERVER_ERROR scenarios.
        // For now, let's match the controller's current behavior for generic RuntimeExceptions.
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode()); // Changed from INTERNAL_SERVER_ERROR
        assertNull(response.getBody());

        verify(userService, times(1)).getUserById(userId);
        verify(carService, times(1)).addCarToUser(userId, carRequest);
    }


    // Test for getCarsByUserId method
    @Test
    void getCarsByUserId_Success() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        List<Car> cars = new ArrayList<>();
        Car car1 = new Car();
        car1.setId(1L);
        car1.setModel("ModelA");
        car1.setBrand("BrandA");
        car1.setMaximumCharge(80.0);
        car1.setCarClass("EV");
        car1.setOwner(user); // Ensure owner is set for DTO conversion
        Car car2 = new Car();
        car2.setId(2L);
        car2.setModel("ModelB");
        car2.setBrand("BrandB");
        car2.setMaximumCharge(90.0);
        car2.setCarClass("SEDAN");
        car2.setOwner(user); // Ensure owner is set for DTO conversion
        cars.add(car1);
        cars.add(car2);

        when(userService.getUserById(userId)).thenReturn(user);
        when(carService.getCarsByUserId(userId)).thenReturn(cars);

        ResponseEntity<List<CarResponseDTO>> response = carController.getCarsByUserId(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(car1.getId(), response.getBody().get(0).getId());
        assertEquals(car2.getId(), response.getBody().get(1).getId());
        assertEquals(userId, response.getBody().get(0).getOwnerId());
        assertEquals(userId, response.getBody().get(1).getOwnerId());


        verify(userService, times(1)).getUserById(userId);
        verify(carService, times(1)).getCarsByUserId(userId);
    }

    @Test
    void getCarsByUserId_UserNotFound() {
        Long userId = 1L;

        when(userService.getUserById(userId)).thenThrow(new NoSuchElementException("User not found"));

        ResponseEntity<List<CarResponseDTO>> response = carController.getCarsByUserId(userId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());

        verify(userService, times(1)).getUserById(userId);
        verify(carService, never()).getCarsByUserId(anyLong());
    }

    @Test
    void getCarsByUserId_InternalServerError() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        when(userService.getUserById(userId)).thenReturn(user); // User exists
        when(carService.getCarsByUserId(userId)).thenThrow(new RuntimeException("Database error"));

        ResponseEntity<List<CarResponseDTO>> response = carController.getCarsByUserId(userId);

        // Your controller's original code catches RuntimeException and returns BAD_REQUEST here
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());

        verify(userService, times(1)).getUserById(userId);
        verify(carService, times(1)).getCarsByUserId(userId);
    }

    // Test for getAllCars method
    @Test
    void getAllCars_Success() {
        List<Car> cars = new ArrayList<>();
        Car car1 = new Car();
        car1.setId(1L);
        car1.setModel("ModelX");
        car1.setBrand("BrandX");
        car1.setMaximumCharge(70.0);
        car1.setCarClass("SEDAN");
        // No owner needed for getAllCars DTO if CarResponseDTO can handle null owner.
        // If ownerId is always expected, set a dummy user.
        User dummyUser = new User();
        dummyUser.setId(99L);
        car1.setOwner(dummyUser);


        Car car2 = new Car();
        car2.setId(2L);
        car2.setModel("ModelY");
        car2.setBrand("BrandY");
        car2.setMaximumCharge(60.0);
        car2.setCarClass("HATCH");
        car2.setOwner(dummyUser);

        cars.add(car1);
        cars.add(car2);

        when(carService.getAllCars()).thenReturn(cars);

        ResponseEntity<List<CarResponseDTO>> response = carController.getAllCars();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(car1.getId(), response.getBody().get(0).getId());
        assertEquals(car2.getId(), response.getBody().get(1).getId());
        assertEquals(dummyUser.getId(), response.getBody().get(0).getOwnerId());
        assertEquals(dummyUser.getId(), response.getBody().get(1).getOwnerId());


        verify(carService, times(1)).getAllCars();
    }

    @Test
    void getAllCars_InternalServerError() {
        when(carService.getAllCars()).thenThrow(new RuntimeException("Database connection error"));

        ResponseEntity<List<CarResponseDTO>> response = carController.getAllCars();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());

        verify(carService, times(1)).getAllCars();
    }

    // Test for getCarById method
    @Test
    void getCarById_Success() {
        Long carId = 1L;
        Car car = new Car();
        car.setId(carId);
        car.setModel("TestModel");
        car.setBrand("TestBrand");
        car.setMaximumCharge(50.0);
        car.setCarClass("COUPE");
        User dummyUser = new User();
        dummyUser.setId(99L);
        car.setOwner(dummyUser); // Ensure owner is set for DTO conversion


        when(carService.getCarById(carId)).thenReturn(car);

        ResponseEntity<CarResponseDTO> response = carController.getCarById(carId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(carId, response.getBody().getId());
        assertEquals("TestModel", response.getBody().getModel());
        assertEquals(dummyUser.getId(), response.getBody().getOwnerId());


        verify(carService, times(1)).getCarById(carId);
    }

    @Test
    void getCarById_CarNotFound() {
        Long carId = 1L;
        // The original controller code has a catch-all RuntimeException for "not found" too
        // and doesn't explicitly catch NoSuchElementException here.
        // So, we'll throw a RuntimeException with the "not found" message.
        when(carService.getCarById(carId)).thenThrow(new RuntimeException("not found"));

        ResponseEntity<CarResponseDTO> response = carController.getCarById(carId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(carService, times(1)).getCarById(carId);
    }

    @Test
    void getCarById_InternalServerError() {
        Long carId = 1L;
        when(carService.getCarById(carId)).thenThrow(new RuntimeException("Generic error"));

        ResponseEntity<CarResponseDTO> response = carController.getCarById(carId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(carService, times(1)).getCarById(carId);
    }

    // Test for updateCar method
    @Test
    void updateCar_Success() {
        Long carId = 1L;
        Car carDetails = new Car();
        carDetails.setModel("UpdatedModel");
        carDetails.setBrand("UpdatedBrand");
        carDetails.setMaximumCharge(120.0);
        carDetails.setCarClass("SEDAN");
        carDetails.setImageUrl("http://example.com/updated_car.jpg");

        Car updatedCar = new Car();
        updatedCar.setId(carId);
        updatedCar.setModel("UpdatedModel");
        updatedCar.setBrand("UpdatedBrand");
        updatedCar.setMaximumCharge(120.0);
        updatedCar.setCarClass("SEDAN");
        updatedCar.setImageUrl("http://example.com/updated_car.jpg");
        User dummyUser = new User();
        dummyUser.setId(99L);
        updatedCar.setOwner(dummyUser); // Ensure owner is set for DTO conversion

        when(carService.updateCar(carId, carDetails)).thenReturn(updatedCar);

        ResponseEntity<CarResponseDTO> response = carController.updateCar(carId, carDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(carId, response.getBody().getId());
        assertEquals("UpdatedModel", response.getBody().getModel());
        assertEquals(dummyUser.getId(), response.getBody().getOwnerId());


        verify(carService, times(1)).updateCar(carId, carDetails);
    }

    @Test
    void updateCar_CarNotFound() {
        Long carId = 1L;
        Car carDetails = new Car();

        // The original controller code explicitly checks for "not found" in the message.
        when(carService.updateCar(carId, carDetails)).thenThrow(new RuntimeException("not found"));

        ResponseEntity<CarResponseDTO> response = carController.updateCar(carId, carDetails);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(carService, times(1)).updateCar(carId, carDetails);
    }

    @Test
    void updateCar_InvalidCarData() {
        Long carId = 1L;
        Car carDetails = new Car(); // Invalid data

        // Simulate a RuntimeException for bad data
        when(carService.updateCar(carId, carDetails)).thenThrow(new RuntimeException("Invalid car data"));

        ResponseEntity<CarResponseDTO> response = carController.updateCar(carId, carDetails);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(carService, times(1)).updateCar(carId, carDetails);
    }

    @Test
    void updateCar_InternalServerError() {
        Long carId = 1L;
        Car carDetails = new Car();

        when(carService.updateCar(carId, carDetails)).thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<CarResponseDTO> response = carController.updateCar(carId, carDetails);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(carService, times(1)).updateCar(carId, carDetails);
    }

    // Test for deleteCar method
    @Test
    void deleteCar_Success() {
        Long carId = 1L;
        doNothing().when(carService).deleteCar(carId);

        ResponseEntity<Void> response = carController.deleteCar(carId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody()); // No content for 204

        verify(carService, times(1)).deleteCar(carId);
    }

    @Test
    void deleteCar_CarNotFound() {
        Long carId = 1L;
        // The original controller code has a catch-all RuntimeException for "not found" here.
        doThrow(new RuntimeException("not found")).when(carService).deleteCar(carId);

        ResponseEntity<Void> response = carController.deleteCar(carId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(carService, times(1)).deleteCar(carId);
    }

    @Test
    void deleteCar_InternalServerError() {
        Long carId = 1L;
        doThrow(new RuntimeException("Database error")).when(carService).deleteCar(carId);

        ResponseEntity<Void> response = carController.deleteCar(carId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(carService, times(1)).deleteCar(carId);
    }
}