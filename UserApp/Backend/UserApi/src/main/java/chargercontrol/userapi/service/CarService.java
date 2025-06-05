package chargercontrol.userapi.service;

import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.CarRepository;
import chargercontrol.userapi.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CarService {

    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public CarService(CarRepository carRepository, UserRepository userRepository) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Car addCarToUser(Long userId, Car car) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        car.setOwner(user);
        return carRepository.save(car);
    }

    public List<Car> getCarsByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }
        return carRepository.findByOwnerId(userId);
    }

    public Car getCarById(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Car not found with id: " + carId));
    }

    @Transactional
    public Car updateCar(Long carId, Car carDetails) {
        Car existingCar = carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Car not found with id: " + carId));

        existingCar.setModel(carDetails.getModel());
        existingCar.setBrand(carDetails.getBrand());
        existingCar.setMaximumCharge(carDetails.getMaximumCharge());
        existingCar.setCarClass(carDetails.getCarClass());
        existingCar.setImageUrl(carDetails.getImageUrl()); // Adicionado o campo imageUrl
        // The owner of the car should not be changed via this method.
        // If car ownership transfer is a feature, it should be handled by a separate,
        // dedicated service method.

        return carRepository.save(existingCar);
    }

    @Transactional
    public void deleteCar(Long carId) {
        if (!carRepository.existsById(carId)) {
            throw new EntityNotFoundException("Car not found with id: " + carId);
        }
        carRepository.deleteById(carId);
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }   
}