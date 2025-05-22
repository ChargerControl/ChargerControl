package chargercontrol.userapi.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Set;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;

class UserTest {
    private Validator validator;
    private User user;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
        user = new User();
        user.setId(1L);
        user.setName("John Doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");
    }

    @Test
    void testValidUser() {
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertTrue(violations.isEmpty(), "Valid user should not have validation violations");
    }

    @Test
    void testNameValidation() {
        // Test empty name
        user.setName("");
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().equals("Name is required")));

        // Test name too short
        user.setName("A");
        violations = validator.validate(user);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().equals("Name must be between 2 and 100 characters")));

        // Test name with invalid characters
        user.setName("John123");
        violations = validator.validate(user);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().equals("Name must contain only letters, spaces, hyphens and apostrophes")));

        // Test valid name with special characters
        user.setName("Mary-Jane O'Connor");
        violations = validator.validate(user);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testEmailValidation() {
        // Test empty email
        user.setEmail("");
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().equals("Email is required")));

        // Test invalid email format
        user.setEmail("invalid-email");
        violations = validator.validate(user);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().equals("Email must be valid")));

        // Test valid email
        user.setEmail("john.doe@example.com");
        violations = validator.validate(user);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testPasswordValidation() {
        // Test empty password
        user.setPassword("");
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().equals("Password is required")));

        // Test password too short
        user.setPassword("short");
        violations = validator.validate(user);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().equals("Password must be at least 8 characters")));

        // Test valid password
        user.setPassword("password123");
        violations = validator.validate(user);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testListManagement() {
        assertNotNull(user.getCars(), "Cars list should be initialized");
        assertNotNull(user.getBookSlots(), "BookSlots list should be initialized");

        Car car = new Car();
        user.getCars().add(car);
        assertEquals(1, user.getCars().size(), "Car should be added to the list");

        BookSlot bookSlot = new BookSlot();
        user.getBookSlots().add(bookSlot);
        assertEquals(1, user.getBookSlots().size(), "BookSlot should be added to the list");
    }
}
