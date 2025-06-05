package chargercontrol.userapi.service;

import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.CarRepository;
import chargercontrol.userapi.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

class CarServiceTest {

    @Mock
    private CarRepository carRepository; // Mock the CarRepository

    @Mock
    private UserRepository userRepository; // Mock the UserRepository

    @InjectMocks
    private CarService carService; // Inject mocks into CarService

    private User testUser;
    private Car testCar1;
    private Car testCar2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this); // Initialize mocks

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setName("Test User Name");

        testCar1 = new Car();
        testCar1.setId(101L);
        testCar1.setModel("Model S");
        testCar1.setBrand("Tesla");
        testCar1.setMaximumCharge(100.0);
        testCar1.setCarClass("LUXURY");
        testCar1.setImageUrl("http://example.com/tesla.png");
        testCar1.setOwner(testUser); // Set owner for existing car scenarios

        testCar2 = new Car();
        testCar2.setId(102L);
        testCar2.setModel("Leaf");
        testCar2.setBrand("Nissan");
        testCar2.setMaximumCharge(60.0);
        testCar2.setCarClass("COMPACT");
        testCar2.setImageUrl("http://example.com/nissan.png");
        testCar2.setOwner(testUser);
    }

    // --- Test for addCarToUser method ---
    @Test
    void addCarToUser_success() {
        // Prepare a new car object without an owner yet
        Car newCar = new Car();
        newCar.setModel("New Car Model");
        newCar.setBrand("New Car Brand");
        newCar.setMaximumCharge(50.0);
        newCar.setCarClass("BASIC");
        newCar.setImageUrl("http://example.com/newcar.png");

        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(carRepository.save(any(Car.class))).thenAnswer(invocation -> {
            Car carToSave = invocation.getArgument(0);
            // Simulate saving by assigning an ID if it's new
            if (carToSave.getId() == null) {
                carToSave.setId(103L); // Assign a new ID for the saved car
            }
            return carToSave;
        });

        Car result = carService.addCarToUser(testUser.getId(), newCar);

        assertNotNull(result);
        assertEquals(103L, result.getId()); // Check the assigned ID
        assertEquals(testUser, result.getOwner()); // Verify owner was set
        assertEquals("New Car Model", result.getModel());
        verify(userRepository, times(1)).findById(testUser.getId());
        verify(carRepository, times(1)).save(newCar);
    }

    @Test
    void addCarToUser_userNotFoundThrowsException() {
        Car newCar = new Car();
        newCar.setModel("ModelX");

        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                carService.addCarToUser(999L, newCar));

        assertEquals("User not found with id: 999", exception.getMessage());
        verify(userRepository, times(1)).findById(999L);
        verify(carRepository, never()).save(any(Car.class)); // Ensure car was not saved
    }

    // --- Test for getCarsByUserId method ---
    @Test
    void getCarsByUserId_userFoundAndReturnsCars() {
        when(userRepository.existsById(testUser.getId())).thenReturn(true);
        when(carRepository.findByOwnerId(testUser.getId())).thenReturn(Arrays.asList(testCar1, testCar2));

        List<Car> result = carService.getCarsByUserId(testUser.getId());

        assertNotNull(result);
        assertEquals(2, result.size());
        assertThat(result).containsExactly(testCar1, testCar2);
        verify(userRepository, times(1)).existsById(testUser.getId());
        verify(carRepository, times(1)).findByOwnerId(testUser.getId());
    }

    @Test
    void getCarsByUserId_userFoundAndReturnsEmptyList() {
        when(userRepository.existsById(testUser.getId())).thenReturn(true);
        when(carRepository.findByOwnerId(testUser.getId())).thenReturn(Collections.emptyList());

        List<Car> result = carService.getCarsByUserId(testUser.getId());

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(userRepository, times(1)).existsById(testUser.getId());
        verify(carRepository, times(1)).findByOwnerId(testUser.getId());
    }

    @Test
    void getCarsByUserId_userNotFoundThrowsException() {
        when(userRepository.existsById(anyLong())).thenReturn(false);

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                carService.getCarsByUserId(999L));

        assertEquals("User not found with id: 999", exception.getMessage());
        verify(userRepository, times(1)).existsById(999L);
        verify(carRepository, never()).findByOwnerId(anyLong());
    }

    // --- Test for getCarById method ---
    @Test
    void getCarById_found() {
        when(carRepository.findById(testCar1.getId())).thenReturn(Optional.of(testCar1));

        Car result = carService.getCarById(testCar1.getId());

        assertNotNull(result);
        assertEquals(testCar1.getId(), result.getId());
        assertEquals(testCar1.getModel(), result.getModel());
        verify(carRepository, times(1)).findById(testCar1.getId());
    }

    @Test
    void getCarById_notFoundThrowsException() {
        when(carRepository.findById(999L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                carService.getCarById(999L));

        assertEquals("Car not found with id: 999", exception.getMessage());
        verify(carRepository, times(1)).findById(999L);
    }

    // --- Test for updateCar method ---
    @Test
    void updateCar_success() {
        // Create car details to update
        Car carDetails = new Car();
        carDetails.setModel("Updated Model");
        carDetails.setBrand("Updated Brand");
        carDetails.setMaximumCharge(120.0);
        carDetails.setCarClass("SPORT");
        carDetails.setImageUrl("http://example.com/updated.png");

        when(carRepository.findById(testCar1.getId())).thenReturn(Optional.of(testCar1));
        when(carRepository.save(any(Car.class))).thenReturn(testCar1); // Return the modified existingCar

        Car updatedCar = carService.updateCar(testCar1.getId(), carDetails);

        assertNotNull(updatedCar);
        assertEquals(testCar1.getId(), updatedCar.getId());
        assertEquals("Updated Model", updatedCar.getModel());
        assertEquals("Updated Brand", updatedCar.getBrand());
        assertEquals(120.0, updatedCar.getMaximumCharge());
        assertEquals("SPORT", updatedCar.getCarClass());
        assertEquals("http://example.com/updated.png", updatedCar.getImageUrl());
        // Ensure owner is unchanged
        assertEquals(testUser, updatedCar.getOwner());

        verify(carRepository, times(1)).findById(testCar1.getId());
        verify(carRepository, times(1)).save(testCar1); // Verify save was called on the existing object
    }

    @Test
    void updateCar_notFoundThrowsException() {
        Car carDetails = new Car();
        carDetails.setModel("Non Existent");

        when(carRepository.findById(anyLong())).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                carService.updateCar(999L, carDetails));

        assertEquals("Car not found with id: 999", exception.getMessage());
        verify(carRepository, times(1)).findById(999L);
        verify(carRepository, never()).save(any(Car.class));
    }

    // --- Test for deleteCar method ---
    @Test
    void deleteCar_success() {
        when(carRepository.existsById(testCar1.getId())).thenReturn(true);
        doNothing().when(carRepository).deleteById(testCar1.getId());

        assertDoesNotThrow(() -> carService.deleteCar(testCar1.getId()));

        verify(carRepository, times(1)).existsById(testCar1.getId());
        verify(carRepository, times(1)).deleteById(testCar1.getId());
    }

    @Test
    void deleteCar_notFoundThrowsException() {
        when(carRepository.existsById(anyLong())).thenReturn(false);

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                carService.deleteCar(999L));

        assertEquals("Car not found with id: 999", exception.getMessage());
        verify(carRepository, times(1)).existsById(999L);
        verify(carRepository, never()).deleteById(anyLong());
    }

    // --- Test for getAllCars method ---
    @Test
    void getAllCars_returnsListOfCars() {
        List<Car> cars = Arrays.asList(testCar1, testCar2);
        when(carRepository.findAll()).thenReturn(cars);

        List<Car> result = carService.getAllCars();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertThat(result).containsExactly(testCar1, testCar2);
        verify(carRepository, times(1)).findAll();
    }

    @Test
    void getAllCars_returnsEmptyListWhenNoCars() {
        when(carRepository.findAll()).thenReturn(Collections.emptyList());

        List<Car> result = carService.getAllCars();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(carRepository, times(1)).findAll();
    }
}
