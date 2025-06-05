package chargercontrol.userapi.dto;

import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User; // Import the User entity
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CarResponseDTOTest {

    private Car testCar;
    private User testOwner;

    @BeforeEach
    void setUp() {
        // Setup a common User (owner) for tests
        testOwner = new User();
        testOwner.setId(10L);
        testOwner.setName("Test Owner");
        testOwner.setEmail("owner@example.com");
        testOwner.setPassword("hashedpassword"); // Not directly used by DTO, but for completeness

        // Setup a common Car for tests
        testCar = new Car();
        testCar.setId(1L);
        testCar.setModel("Model X");
        testCar.setBrand("Tesla");
        testCar.setMaximumCharge(90.5);
        testCar.setCarClass("SUV");
        testCar.setImageUrl("http://example.com/modelx.png");
        testCar.setOwner(testOwner); // Link the owner
    }

    @Test
    void testNoArgsConstructorAndGettersSetters() {
        // Arrange
        CarResponseDTO dto = new CarResponseDTO();

        // Act - Set values
        Long expectedId = 2L;
        String expectedModel = "Leaf";
        String expectedBrand = "Nissan";
        double expectedMaximumCharge = 40.0;
        String expectedCarClass = "Compact";
        Long expectedOwnerId = 20L;
        String expectedOwnerName = "Another Owner";
        String expectedOwnerEmail = "another@example.com";

        dto.setId(expectedId);
        dto.setModel(expectedModel);
        dto.setBrand(expectedBrand);
        dto.setMaximumCharge(expectedMaximumCharge);
        dto.setCarClass(expectedCarClass);
        dto.setOwnerId(expectedOwnerId);
        dto.setOwnerName(expectedOwnerName);
        dto.setOwnerEmail(expectedOwnerEmail);

        // Assert - Get values
        assertEquals(expectedId, dto.getId(), "ID should match set value");
        assertEquals(expectedModel, dto.getModel(), "Model should match set value");
        assertEquals(expectedBrand, dto.getBrand(), "Brand should match set value");
        assertEquals(expectedMaximumCharge, dto.getMaximumCharge(), 0.001, "Maximum Charge should match set value");
        assertEquals(expectedCarClass, dto.getCarClass(), "Car Class should match set value");
        assertEquals(expectedOwnerId, dto.getOwnerId(), "Owner ID should match set value");
        assertEquals(expectedOwnerName, dto.getOwnerName(), "Owner Name should match set value");
        assertEquals(expectedOwnerEmail, dto.getOwnerEmail(), "Owner Email should match set value");
    }

    @Test
    void testAllArgsConstructor() {
        // Arrange
        Long expectedId = 3L;
        String expectedModel = "EQB";
        String expectedBrand = "Mercedes-Benz";
        double expectedMaximumCharge = 70.0;
        String expectedCarClass = "Luxury SUV";
        Long expectedOwnerId = 30L;
        String expectedOwnerName = "Third Owner";
        String expectedOwnerEmail = "third@example.com";

        // Act
        CarResponseDTO dto = new CarResponseDTO(
                expectedId, expectedModel, expectedBrand, expectedMaximumCharge,
                expectedCarClass, expectedOwnerId, expectedOwnerName, expectedOwnerEmail
        );

        // Assert
        assertEquals(expectedId, dto.getId(), "ID should be initialized by all-args constructor");
        assertEquals(expectedModel, dto.getModel(), "Model should be initialized by all-args constructor");
        assertEquals(expectedBrand, dto.getBrand(), "Brand should be initialized by all-args constructor");
        assertEquals(expectedMaximumCharge, dto.getMaximumCharge(), 0.001, "Maximum Charge should be initialized by all-args constructor");
        assertEquals(expectedCarClass, dto.getCarClass(), "Car Class should be initialized by all-args constructor");
        assertEquals(expectedOwnerId, dto.getOwnerId(), "Owner ID should be initialized by all-args constructor");
        assertEquals(expectedOwnerName, dto.getOwnerName(), "Owner Name should be initialized by all-args constructor");
        assertEquals(expectedOwnerEmail, dto.getOwnerEmail(), "Owner Email should be initialized by all-args constructor");
    }

    @Test
    void testCarEntityConstructor_withOwner() {
        // Act
        CarResponseDTO dto = new CarResponseDTO(testCar);

        // Assert
        assertEquals(testCar.getId(), dto.getId(), "ID should be mapped from Car entity");
        assertEquals(testCar.getModel(), dto.getModel(), "Model should be mapped from Car entity");
        assertEquals(testCar.getBrand(), dto.getBrand(), "Brand should be mapped from Car entity");
        assertEquals(testCar.getMaximumCharge(), dto.getMaximumCharge(), 0.001, "Maximum Charge should be mapped from Car entity");
        assertEquals(testCar.getCarClass(), dto.getCarClass(), "Car Class should be mapped from Car entity");

        assertNotNull(dto.getOwnerId(), "Owner ID should not be null when owner exists");
        assertNotNull(dto.getOwnerName(), "Owner Name should not be null when owner exists");
        assertNotNull(dto.getOwnerEmail(), "Owner Email should not be null when owner exists");

        assertEquals(testOwner.getId(), dto.getOwnerId(), "Owner ID should be mapped from Car entity's owner");
        assertEquals(testOwner.getName(), dto.getOwnerName(), "Owner Name should be mapped from Car entity's owner");
        assertEquals(testOwner.getEmail(), dto.getOwnerEmail(), "Owner Email should be mapped from Car entity's owner");
    }

    @Test
    void testCarEntityConstructor_withoutOwner() {
        // Arrange - Create a car with no owner
        Car carWithoutOwner = new Car();
        carWithoutOwner.setId(4L);
        carWithoutOwner.setModel("Ioniq");
        carWithoutOwner.setBrand("Hyundai");
        carWithoutOwner.setMaximumCharge(50.0);
        carWithoutOwner.setCarClass("Sedan");
        carWithoutOwner.setImageUrl("http://example.com/ioniq.png");
        carWithoutOwner.setOwner(null); // Explicitly set owner to null

        // Act
        CarResponseDTO dto = new CarResponseDTO(carWithoutOwner);

        // Assert
        assertEquals(carWithoutOwner.getId(), dto.getId(), "ID should be mapped from Car entity");
        assertEquals(carWithoutOwner.getModel(), dto.getModel(), "Model should be mapped from Car entity");
        assertEquals(carWithoutOwner.getBrand(), dto.getBrand(), "Brand should be mapped from Car entity");
        assertEquals(carWithoutOwner.getMaximumCharge(), dto.getMaximumCharge(), 0.001, "Maximum Charge should be mapped from Car entity");
        assertEquals(carWithoutOwner.getCarClass(), dto.getCarClass(), "Car Class should be mapped from Car entity");

        assertNull(dto.getOwnerId(), "Owner ID should be null when car has no owner");
        assertNull(dto.getOwnerName(), "Owner Name should be null when car has no owner");
        assertNull(dto.getOwnerEmail(), "Owner Email should be null when car has no owner");
    }

    // This test now explicitly asserts that a NullPointerException is thrown
    // when a null 'Car' object is passed to the constructor.
    // This reflects the current behavior of the CarResponseDTO class.
    @Test
    void testCarEntityConstructor_withNullCarInput_shouldThrowNullPointerException() {
        assertThrows(NullPointerException.class, () -> {
            new CarResponseDTO(null);
        }, "CarResponseDTO constructor should throw NullPointerException when 'car' is null.");
    }
}