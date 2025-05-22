package chargercontrol.userapi.service;
import ch.qos.logback.classic.encoder.JsonEncoder;
import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public List<Car> getCarsByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return user.get().getCars();
        } else {
            logger.error("User not found with email: {}", email);
            throw new RuntimeException("User not found with email: " + email);
        }
    }

    public User createUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }


    public void updateUser(Long id, User user) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User updatedUser = existingUser.get();
            updatedUser.setName(user.getName());
            updatedUser.setEmail(user.getEmail());
            updatedUser.setPassword(passwordEncoder.encode(user.getPassword())); // Password should be encoded
            userRepository.save(updatedUser);
        } else {
            logger.error("User not found with id: {}", id);
            throw new RuntimeException("User not found with id: " + id);
        }
    }

    public void deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            userRepository.delete(user.get());
        } else {
            logger.error("User not found with id: {}", id);
            throw new RuntimeException("User not found with id: " + id);
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public void addCarToUser(String email, Car car) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            User user2 = user.get();
            user2.getCars().add(car);
            userRepository.save(user2);
        } else {
            logger.error("User not found with email: {}", email);
            throw new RuntimeException("User not found with email: " + email);
        }
    }

    public void removeCarFromUser(String email, Car car) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            User user2 = user.get();
            user2.getCars().remove(car);
            userRepository.save(user2);
        } else {
            logger.error("User not found with email: {}", email);
            throw new RuntimeException("User not found with email: " + email);
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", email);
                    return new RuntimeException("User not found with email: " + email);
                });
    }

    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }


}
