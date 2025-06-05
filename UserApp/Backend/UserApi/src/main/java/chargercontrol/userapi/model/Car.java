package chargercontrol.userapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
import java.util.Objects;

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
    
    @Column(name = "image_url", length = 500)
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([/\\w \\.-]*)*/?$",
            message = "Please provide a valid URL")
    private String imageUrl;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // Evita referência circular com User
    private User owner;
    
    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore // Evita lazy loading exception
    private List<BookSlot> bookSlots;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Car)) return false;
        Car car = (Car) o;
        return Double.compare(car.maximumCharge, maximumCharge) == 0 &&
                Objects.equals(id, car.id) &&
                Objects.equals(model, car.model) &&
                Objects.equals(brand, car.brand) &&
                Objects.equals(carClass, car.carClass) &&
                Objects.equals(imageUrl, car.imageUrl) &&
                Objects.equals(owner, car.owner);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, model, brand, maximumCharge, carClass, imageUrl, owner);
    }
}