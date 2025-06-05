package chargercontrol.userapi.model;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class CarDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        // Initialize the validator before each test
        // This is necessary to test the validation annotations (@NotBlank, @Size, @Pattern, @Positive)
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    void testNoArgsConstructorAndGettersSetters() {
        // Create an instance using the no-args constructor
        CarDTO carDTO = new CarDTO();

        // Set values using generated setters
        Long testId = 1L;
        String testModel = "Model 3";
        String testBrand = "Tesla";
        double testMaximumCharge = 75.0;
        String testCarClass = "SEDAN";
        String testImageUrl = "https://example.com/model3.jpg";

        carDTO.setId(testId);
        carDTO.setModel(testModel);
        carDTO.setBrand(testBrand);
        carDTO.setMaximumCharge(testMaximumCharge);
        carDTO.setCarClass(testCarClass);
        carDTO.setImageUrl(testImageUrl);

        // Verify values using generated getters
        assertEquals(testId, carDTO.getId(), "ID should match the set value");
        assertEquals(testModel, carDTO.getModel(), "Model should match the set value");
        assertEquals(testBrand, carDTO.getBrand(), "Brand should match the set value");
        assertEquals(testMaximumCharge, carDTO.getMaximumCharge(), 0.001, "Maximum charge should match the set value");
        assertEquals(testCarClass, carDTO.getCarClass(), "Car class should match the set value");
        assertEquals(testImageUrl, carDTO.getImageUrl(), "Image URL should match the set value");
    }

    @Test
    void testAllArgsConstructor() {
        // Create an instance using the all-args constructor
        Long testId = 2L;
        String testModel = "e-tron";
        String testBrand = "Audi";
        double testMaximumCharge = 95.0;
        String testCarClass = "SUV";
        String testImageUrl = "http://another.com/etron.png";

        CarDTO carDTO = new CarDTO(testId, testModel, testBrand, testMaximumCharge, testCarClass, testImageUrl);

        // Verify values directly from constructor initialization
        assertEquals(testId, carDTO.getId(), "ID should be initialized by all-args constructor");
        assertEquals(testModel, carDTO.getModel(), "Model should be initialized by all-args constructor");
        assertEquals(testBrand, carDTO.getBrand(), "Brand should be initialized by all-args constructor");
        assertEquals(testMaximumCharge, carDTO.getMaximumCharge(), 0.001, "Maximum charge should be initialized by all-args constructor");
        assertEquals(testCarClass, carDTO.getCarClass(), "Car class should be initialized by all-args constructor");
        assertEquals(testImageUrl, carDTO.getImageUrl(), "Image URL should be initialized by all-args constructor");
    }

    @Test
    void testValidCarDTO() {
        CarDTO carDTO = new CarDTO(1L, "Fusion EV", "Ford", 60.0, "SEDAN", "https://example.com/fusion.jpg");
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertTrue(violations.isEmpty(), "Valid CarDTO should have no violations: " + violations);
    }

    // --- Validation Tests ---

    @Test
    void testInvalidModel_blank() {
        CarDTO carDTO = new CarDTO(1L, "", "Ford", 60.0, "SEDAN", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("model") && v.getMessage().equals("Model is required")));
    }

    @Test
    void testInvalidModel_tooLong() {
        CarDTO carDTO = new CarDTO(1L, "a".repeat(101), "Ford", 60.0, "SEDAN", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("model") && v.getMessage().contains("between 1 and 100 characters")));
    }

    @Test
    void testInvalidModel_invalidCharacters() {
        CarDTO carDTO = new CarDTO(1L, "Model@!", "Ford", 60.0, "SEDAN", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("model") && v.getMessage().equals("Model must contain only letters, numbers, spaces, and hyphens")));
    }

    @Test
    void testInvalidBrand_blank() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "", 60.0, "SUV", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("brand") && v.getMessage().equals("Brand is required")));
    }

    @Test
    void testInvalidBrand_tooLong() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "a".repeat(101), 60.0, "SUV", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("brand") && v.getMessage().contains("between 1 and 100 characters")));
    }

    @Test
    void testInvalidBrand_invalidCharacters() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "Brand#", 60.0, "SUV", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("brand") && v.getMessage().equals("Brand must contain only letters, numbers, spaces, and hyphens")));
    }

    @Test
    void testInvalidMaximumCharge_notPositive() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "BrandY", 0.0, "SUV", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("maximumCharge") && v.getMessage().equals("Maximum charge must be positive")));

        carDTO.setMaximumCharge(-10.0); // Test negative
        violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("maximumCharge") && v.getMessage().equals("Maximum charge must be positive")));
    }

    @Test
    void testInvalidCarClass_blank() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "BrandY", 60.0, "", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("carClass") && v.getMessage().equals("Car class is required")));
    }

    @Test
    void testInvalidCarClass_tooLong() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "BrandY", 60.0, "A".repeat(51), null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("carClass") && v.getMessage().contains("between 1 and 50 characters")));
    }

    @Test
    void testInvalidCarClass_invalidCharacters() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "BrandY", 60.0, "suv", null); // lowercase
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("carClass") && v.getMessage().equals("Car class must contain only uppercase letters and numbers")));

        carDTO.setCarClass("SUV-"); // Contains hyphen
        violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("carClass") && v.getMessage().equals("Car class must contain only uppercase letters and numbers")));
    }

    @Test
    void testInvalidImageUrl_tooLong() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "BrandY", 60.0, "SUV", "http://example.com/" + "a".repeat(480) + ".jpg"); // Total > 500
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("imageUrl") && v.getMessage().contains("not exceed 500 characters")));
    }

    @Test
    void testInvalidImageUrl_invalidFormat() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "BrandY", 60.0, "SUV", "not-a-valid-url");
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("imageUrl") && v.getMessage().equals("Please provide a valid URL")));

        carDTO.setImageUrl("ftp://invalid.com"); // FTP is not http/https
        violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("imageUrl") && v.getMessage().equals("Please provide a valid URL")));
    }

    @Test
    void testImageUrl_nullIsValid() {
        CarDTO carDTO = new CarDTO(1L, "ModelX", "BrandY", 60.0, "SUV", null);
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertTrue(violations.isEmpty(), "Null image URL should be valid if not @NotBlank");
    }

    @Test
    void testAllFieldsNullExceptRequired_shouldFailValidation() {
        CarDTO carDTO = new CarDTO(null, null, null, 0.0, null, null); // All null/default except ID
        Set<ConstraintViolation<CarDTO>> violations = validator.validate(carDTO);
        assertFalse(violations.isEmpty(), "DTO with null required fields should have violations");
        assertEquals(4, violations.size()); // model (blank, size, pattern), brand (blank, size, pattern), maximumCharge (positive), carClass (blank, size, pattern)
        // Check for specific messages
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("model") && v.getMessage().equals("Model is required")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("brand") && v.getMessage().equals("Brand is required")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("maximumCharge") && v.getMessage().equals("Maximum charge must be positive")));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("carClass") && v.getMessage().equals("Car class is required")));
    }
}