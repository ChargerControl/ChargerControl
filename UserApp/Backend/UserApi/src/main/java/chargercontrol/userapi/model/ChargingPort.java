package chargercontrol.userapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @JsonIgnore // Evita serialização circular
    private Station station;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Charging port status is required")
    private ChargingPortStatus status;
    
    @Column(nullable = false)
    @PositiveOrZero(message = "Energy used must be zero or positive")
    private Double energyUsed = 0.0; // Default to 0.0 kWh
    
    @Column(nullable = false)
    @NotBlank(message = "Port identifier cannot be blank")
    private String portIdentifier; // e.g., "Port 1", "A01"
    
    // Campo adicional para referenciar o ID da station (útil para serialização)
    @Transient
    private Long stationId;
    
    // Método para popular o stationId quando necessário
    @PostLoad
    @PostPersist
    @PostUpdate
    public void populateStationId() {
        if (this.station != null) {
            this.stationId = this.station.getId();
        }
    }
}