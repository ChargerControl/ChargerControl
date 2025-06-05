package chargercontrol.userapi.model; // Note: DTOs are usually in a .dto package

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class BookRequestTest {

    @Test
    void testNoArgsConstructorAndGettersSetters() {
        // Arrange
        BookRequest bookRequest = new BookRequest();
        Long testUserId = 1L;
        LocalDateTime testStartTime = LocalDateTime.of(2025, 6, 5, 10, 30);
        Long testStationId = 101L;
        Long testCarId = 5L;
        Integer testDuration = 60;

        // Act
        bookRequest.setUserId(testUserId);
        bookRequest.setStartTime(testStartTime);
        bookRequest.setStationId(testStationId);
        bookRequest.setCarId(testCarId);
        bookRequest.setDuration(testDuration);

        // Assert
        assertEquals(testUserId, bookRequest.getUserId(), "User ID should match the set value");
        assertEquals(testStartTime, bookRequest.getStartTime(), "Start time should match the set value");
        assertEquals(testStationId, bookRequest.getStationId(), "Station ID should match the set value");
        assertEquals(testCarId, bookRequest.getCarId(), "Car ID should match the set value");
        assertEquals(testDuration, bookRequest.getDuration(), "Duration should match the set value");
    }

    @Test
    void testAllArgsConstructor() {
        // Arrange
        Long testUserId = 2L;
        LocalDateTime testStartTime = LocalDateTime.of(2025, 6, 5, 14, 0);
        Long testStationId = 102L;
        Long testCarId = 6L;
        Integer testDuration = 120;

        // Act
        BookRequest bookRequest = new BookRequest(testUserId, testStartTime, testStationId, testCarId, testDuration);

        // Assert
        assertEquals(testUserId, bookRequest.getUserId(), "User ID should be initialized by all-args constructor");
        assertEquals(testStartTime, bookRequest.getStartTime(), "Start time should be initialized by all-args constructor");
        assertEquals(testStationId, bookRequest.getStationId(), "Station ID should be initialized by all-args constructor");
        assertEquals(testCarId, bookRequest.getCarId(), "Car ID should be initialized by all-args constructor");
        assertEquals(testDuration, bookRequest.getDuration(), "Duration should be initialized by all-args constructor");
    }

    @Test
    void testSettersWithNullValues() {
        // Arrange
        BookRequest bookRequest = new BookRequest();

        // Act
        bookRequest.setUserId(null);
        bookRequest.setStartTime(null);
        bookRequest.setStationId(null);
        bookRequest.setCarId(null);
        bookRequest.setDuration(null);

        // Assert
        assertNull(bookRequest.getUserId(), "User ID should be null after setting null");
        assertNull(bookRequest.getStartTime(), "Start time should be null after setting null");
        assertNull(bookRequest.getStationId(), "Station ID should be null after setting null");
        assertNull(bookRequest.getCarId(), "Car ID should be null after setting null");
        assertNull(bookRequest.getDuration(), "Duration should be null after setting null");
    }

    @Test
    void testExplicitGettersMatchLombokGenerated() {
        // This test ensures that your manually defined getters don't conflict or behave differently
        // than what Lombok generates for the same fields, if you were to remove the explicit ones.
        // For simple field access, they are identical.
        Long testUserId = 3L;
        LocalDateTime testStartTime = LocalDateTime.of(2025, 6, 5, 18, 0);
        Long testStationId = 103L;
        Long testCarId = 7L;
        Integer testDuration = 30;

        BookRequest bookRequest = new BookRequest(testUserId, testStartTime, testStationId, testCarId, testDuration);

        assertEquals(testUserId, bookRequest.getUserId());
        assertEquals(testStartTime, bookRequest.getStartTime());
        assertEquals(testStationId, bookRequest.getStationId());
        assertEquals(testCarId, bookRequest.getCarId());
        assertEquals(testDuration, bookRequest.getDuration());
    }
}