package chargercontrol.userapi.model;

import jakarta.persistence.Entity; // Keep if it's an entity, though typically DTOs are not @Entity
import jakarta.validation.constraints.FutureOrPresent; // For future or present date/time
import jakarta.validation.constraints.Min;             // For minimum numeric value
import jakarta.validation.constraints.NotNull;          // For non-null fields
import jakarta.validation.constraints.Positive;         // For positive numbers

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Note: DTOs (Data Transfer Objects) are typically not @Entity
// @Entity annotation usually belongs on JPA entities that map to database tables.
// If this is strictly a request DTO, you might want to remove @Entity.
public class BookRequest {

    // Your explicit getters are redundant due to Lombok's @Getter,
    // but they don't cause issues. Keep them if you have a specific reason.
    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Long userId;

    @NotNull(message = "Start time is required")
    @FutureOrPresent(message = "Start time must be in the present or future")
    private LocalDateTime startTime;

    @NotNull(message = "Station ID is required")
    @Positive(message = "Station ID must be positive")
    private Long stationId;

    @NotNull(message = "Car ID is required")
    @Positive(message = "Car ID must be positive")
    private Long carId;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    // Assuming a max reasonable duration for a single booking, e.g., 24 hours (1440 minutes)
    // Adjust max value based on your business logic
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer duration;

}