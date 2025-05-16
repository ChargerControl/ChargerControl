package chargercontrol.userapi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "charging_ports")
public class ChargingPort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @NotNull(message = "Station cannot be null")
    private Station station;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Charging port status is required")
    private ChargingPortStatus status;

    @Column(nullable = false)
    @PositiveOrZero(message = "Energy used must be zero or positive")
    private Double energyUsed = 0.0; // Default to 0.0 kWh

    @OneToMany(mappedBy = "chargingPort", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BookSlot> bookSlots;

    // Consider adding a port identifier within the station, e.g., portNumber
    @Column(nullable = false)
    private String portIdentifier; // e.g., "Port 1", "A01"
}
