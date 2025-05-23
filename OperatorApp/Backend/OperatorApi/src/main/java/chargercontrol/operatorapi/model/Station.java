package chargercontrol.operatorapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stations")
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Station name is required")
    @Size(min = 2, max = 100, message = "Station name must be between 2 and 100 characters")
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @Column(nullable = false)
    @NotNull(message = "Power is required")
    @Positive(message = "Power must be positive")
    private Double power; // em kW

    @Column(nullable = false)
    @NotNull(message = "Latitude is required")
    private Double latitude;

    @Column(nullable = false)
    @NotNull(message = "Longitude is required")
    private Double longitude;

    @Column(nullable = false)
    @NotNull(message = "Availability is required")
    private Boolean available = true; // Default disponível

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Charging type is required")
    private ChargingType chargingType;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore // Evita problema de lazy loading e serialização circular
    private List<ChargingPort> chargingPorts = new ArrayList<>();

    // Campo transiente para mostrar a contagem de ports se necessário
    @Transient
    private Integer totalPorts;

    @Transient
    private Integer availablePorts;

    // Métodos utilitários
    public void addChargingPort(ChargingPort port) {
        chargingPorts.add(port);
        port.setStation(this);
    }

    public void removeChargingPort(ChargingPort port) {
        chargingPorts.remove(port);
        port.setStation(null);
    }
}