package chargercontrol.userapi.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CarDTO {
    
    private Long id;

    @NotBlank(message = "Model is required")
    @Size(min = 1, max = 100, message = "Model must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s-]+$", message = "Model must contain only letters, numbers, spaces, and hyphens")
    private String model;

    @NotBlank(message = "Brand is required")
    @Size(min = 1, max = 100, message = "Brand must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s-]+$", message = "Brand must contain only letters, numbers, spaces, and hyphens")
    private String brand;

    @Positive(message = "Maximum charge must be positive")
    private double maximumCharge;

    @NotBlank(message = "Car class is required")
    @Size(min = 1, max = 50, message = "Car class must be between 1 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Car class must contain only uppercase letters and numbers")
    private String carClass;
}