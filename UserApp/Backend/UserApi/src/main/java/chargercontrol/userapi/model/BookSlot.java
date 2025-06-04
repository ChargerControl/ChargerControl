package chargercontrol.userapi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"user", "car", "chargingPort"})
@Entity
@Table(name = "book_slots")
public class BookSlot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User cannot be null")
    @JsonIgnoreProperties({"bookings", "cars", "password"}) // Evita ciclo e dados sensíveis
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charging_port_id", nullable = false)
    @NotNull(message = "Charging port cannot be null")
    @JsonIgnoreProperties({"bookings", "station"}) // Evita ciclo
    private ChargingPort chargingPort;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    @NotNull(message = "Car cannot be null")
    @JsonIgnoreProperties({"bookings", "user"}) // Evita ciclo
    private Car car;
    
    @Column(nullable = false)
    @NotNull(message = "Booking date and time cannot be null")
    @FutureOrPresent(message = "Booking date must be in the present or future")
    private LocalDateTime bookingTime;
    
    @Column(nullable = false)
    @NotNull(message = "Duration cannot be null")
    @Positive(message = "Duration must be a positive value")
    private Integer duration; // Duration in minutes
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Booking status is required")
    private BookingStatus status;
}