package chargercontrol.userapi.service;

import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("John Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPassword("password123");
    }

    @Test
    void createUser_Success() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(testUser.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User savedUser = userService.createUser(testUser);

        assertNotNull(savedUser);
        assertEquals(testUser.getName(), savedUser.getName());
        assertEquals(testUser.getEmail(), savedUser.getEmail());
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getCarsByEmail_Success() {
        Car car1 = new Car();
        car1.setId(1L);
        car1.setModel("Tesla Model S");
        Car car2 = new Car();
        car2.setId(2L);
        car2.setModel("Ford Mustang");
        List<Car> carList = Arrays.asList(car1, car2);

        testUser.setCars(carList);
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        List<Car> cars = userService.getCarsByEmail(testUser.getEmail());

        assertNotNull(cars);
        assertEquals(2, cars.size());
        assertTrue(cars.contains(car1));
        assertTrue(cars.contains(car2));
        verify(userRepository).findByEmail(testUser.getEmail());
    }

    @Test
    void userExists_Success() {
        when(userRepository.existsByEmail(testUser.getEmail())).thenReturn(true);

        boolean exists = userService.userExists(testUser.getEmail());
        assertTrue(exists);
        verify(userRepository).existsByEmail(testUser.getEmail());
    }

    @Test
    void createUser_DuplicateEmail() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> userService.createUser(testUser));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_PasswordEncoderFailure() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenThrow(new RuntimeException("Encoding failed"));

        assertThrows(RuntimeException.class, () -> userService.createUser(testUser));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_RepositorySaveFailure() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> userService.createUser(testUser));
    }

    @Test
    void createUser_NullUser() {
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(null));
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_InvalidEmail() {
        testUser.setEmail("");
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUser));
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_InvalidPassword() {
        testUser.setPassword("");
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUser));
        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        User foundUser = userService.getUserById(1L);

        assertNotNull(foundUser);
        assertEquals(testUser.getId(), foundUser.getId());
        assertEquals(testUser.getName(), foundUser.getName());
    }

    @Test
    void getUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById(999L));
    }

    @Test
    void getAllUsers_Success() {
        User user2 = new User();
        user2.setId(2L);
        user2.setName("Jane Doe");
        user2.setEmail("jane.doe@example.com");

        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser, user2));

        List<User> users = userService.getAllUsers();

        assertNotNull(users);
        assertEquals(2, users.size());
        assertTrue(users.stream().anyMatch(u -> u.getEmail().equals("john.doe@example.com")));
        assertTrue(users.stream().anyMatch(u -> u.getEmail().equals("jane.doe@example.com")));
    }

    @Test
    void getAllUsers_RepositoryFailure() {
        when(userRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> userService.getAllUsers());
    }

    @Test
    void updateUser_Success() {
        // Prepare updated user data
        User updatedUser = new User();
        updatedUser.setId(1L);
        updatedUser.setName("John Updated");
        updatedUser.setEmail("john.updated@example.com");
        updatedUser.setPassword("newpassword123");

        // Mock repository behavior
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
        when(passwordEncoder.encode(updatedUser.getPassword())).thenReturn("encodedNewPassword");

        // Execute update
        userService.updateUser(1L, updatedUser);

        // Verify interactions and results
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode(updatedUser.getPassword());

        // Capture the saved user to verify field updates
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals("John Updated", savedUser.getName());
        assertEquals("john.updated@example.com", savedUser.getEmail());
    }

    @Test
    void updateUser_NotFound() {
        User updatedUser = new User();
        updatedUser.setId(999L);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.updateUser(999L, updatedUser));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        userService.deleteUser(1L);

        verify(userRepository).delete(testUser);
    }

    @Test
    void deleteUser_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.deleteUser(999L));
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    void getUserByEmail_Success() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        User foundUser = userService.getUserByEmail(testUser.getEmail());

        assertNotNull(foundUser);
        assertEquals(testUser.getEmail(), foundUser.getEmail());
    }

    @Test
    void getUserByEmail_NotFound() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserByEmail("nonexistent@example.com"));
    }

    @Test
    void getUserByEmail_RepositoryFailure() {
        when(userRepository.findByEmail(any())).thenThrow(new RuntimeException("Database connection failed"));

        assertThrows(RuntimeException.class, () -> userService.getUserByEmail(testUser.getEmail()));
    }

    @Test
    void addCarToUser_Success() {
        Car car = new Car();
        car.setId(1L);
        car.setModel("Tesla Model S");
        testUser.setCars(new java.util.ArrayList<>());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertDoesNotThrow(() -> userService.addCarToUser(testUser.getEmail(), car));
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(userRepository).save(testUser);
        assertTrue(testUser.getCars().contains(car));
    }

    @Test
    void addCarToUser_UserNotFound() {
        Car car = new Car();
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> userService.addCarToUser("notfound@example.com", car));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void removeCarFromUser_Success() {
        Car car = new Car();
        car.setId(1L);
        car.setModel("Tesla Model S");
        java.util.List<Car> cars = new java.util.ArrayList<>();
        cars.add(car);
        testUser.setCars(cars);
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertDoesNotThrow(() -> userService.removeCarFromUser(testUser.getEmail(), car));
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(userRepository).save(testUser);
        assertFalse(testUser.getCars().contains(car));
    }

    @Test
    void removeCarFromUser_UserNotFound() {
        Car car = new Car();
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> userService.removeCarFromUser("notfound@example.com", car));
        verify(userRepository, never()).save(any(User.class));
    }
}
