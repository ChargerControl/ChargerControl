package chargercontrol.userapi.service;
import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public List<Car> getCarsByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            return user.getCars();
        } else {
            logger.error("User not found with email: {}", email);
            return null;
        }
    }

    public void addCarToUser(String email, Car car) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.getCars().add(car);
            userRepository.save(user);
        } else {
            logger.error("User not found with email: {}", email);
        }
    }

    public void removeCarFromUser(String email, Car car) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.getCars().remove(car);
            userRepository.save(user);
        } else {
            logger.error("User not found with email: {}", email);
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }


}
