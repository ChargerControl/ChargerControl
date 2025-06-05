package chargercontrol.userapi.dto;

import chargercontrol.userapi.model.ChargingPortStatus;
import jakarta.validation.constraints.NotBlank; // Import these
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero; // For energyUsed if it can be 0.0

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChargingPortRequest {

    @NotBlank(message = "Port identifier is required") // Example validation
    private String portIdentifier;

    @NotNull(message = "Status is required") // Example validation
    private ChargingPortStatus status;

    @NotNull(message = "Energy used is required")
    @PositiveOrZero(message = "Energy used must be zero or positive") // Example validation
    private Double energyUsed;
}