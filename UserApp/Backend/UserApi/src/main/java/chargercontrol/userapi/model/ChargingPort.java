package chargercontrol.userapi.model;

import java.util.ArrayList;
import java.util.List;
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
    private Double energyUsed = 0.0;
    
    @Column(nullable = false)
    @NotBlank(message = "Port identifier cannot be blank")
    private String portIdentifier;
    
    @Transient
    private Long stationId;
    
    @OneToMany(mappedBy = "chargingPort", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Evita lazy loading exception
    private List<BookSlot> bookSlots = new ArrayList<>();

    public ChargingPort(long l, Station testStation, String a02, ChargingPortStatus chargingPortStatus, double v) {
    }

    @PostLoad
    @PostPersist
    @PostUpdate
    public void populateStationId() {
        if (this.station != null) {
            this.stationId = this.station.getId();
        }
    }
}