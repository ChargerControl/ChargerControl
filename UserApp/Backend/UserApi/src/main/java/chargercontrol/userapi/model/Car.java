package chargercontrol.userapi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Model is required")
    @Size(min = 1, max = 100, message = "Model must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s-]+$", message = "Model must contain only letters, numbers, spaces, and hyphens")
    private String model;

    @Column(nullable = false)
    @NotBlank(message = "Brand is required")
    @Size(min = 1, max = 100, message = "Brand must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s-]+$", message = "Brand must contain only letters, numbers, spaces, and hyphens")
    private String brand;

    @Column(nullable = false)
    @Positive(message = "Maximum charge must be positive")
    private double maximumCharge;

    @Column(nullable = false)
    @NotBlank(message = "Car class is required")
    @Size(min = 1, max = 50, message = "Car class must be between 1 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Car class must contain only uppercase letters and numbers")
    private String carClass;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BookSlot> bookSlots;
}