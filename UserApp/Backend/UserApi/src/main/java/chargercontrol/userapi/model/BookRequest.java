package chargercontrol.userapi.model;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookRequest {
    // jwt token
    private String jwtToken;

    //start hour and day of the booking
    private LocalDateTime startTime;


    private Long stationId;

    // Car ID for booking
    private Long carId;

    // Duration of booking in minutes
    private Integer duration;

    public Long getStationId() {
        return stationId;
    }

    public Long getCarId() {
        return carId;
    }

    public Integer getDuration() {
        return duration;
    }
}
