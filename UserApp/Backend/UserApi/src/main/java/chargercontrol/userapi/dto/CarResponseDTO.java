package chargercontrol.userapi.dto;

import chargercontrol.userapi.model.Car;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CarResponseDTO {
    private Long id;
    private String model;
    private String brand;
    private double maximumCharge;
    private String carClass;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;

    // Constructor to convert from Car entity to DTO
    public CarResponseDTO(Car car) {
        this.id = car.getId();
        this.model = car.getModel();
        this.brand = car.getBrand();
        this.maximumCharge = car.getMaximumCharge();
        this.carClass = car.getCarClass();
        
        // Safely access owner information without triggering lazy loading
        if (car.getOwner() != null) {
            this.ownerId = car.getOwner().getId();
            this.ownerName = car.getOwner().getName();
            this.ownerEmail = car.getOwner().getEmail();
        }
    }
}