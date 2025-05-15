package chargercontrol.userapi.controller;

import chargercontrol.userapi.jwt.JwtUtil;
import chargercontrol.userapi.model.AuthRequest;
import chargercontrol.userapi.model.AuthResponse;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import chargercontrol.userapi.service.UserService;
import jakarta.validation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Service
@RequestMapping("/apiV1/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody User user) {
        try {
            // Check if email already exists
            if (userRepository.findByEmail(user.getEmail()) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(null, "Email already in use"));
            }

            User savedUser = userRepository.save(user);

            String jwt = jwtUtil.generateToken(savedUser.getEmail());

            return ResponseEntity.ok(new AuthResponse(jwt, null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authenticationRequest) {
        try {
            User user = userService.getUserByEmail(authenticationRequest.getEmail());

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(null, "Invalid email or password"));
            }

            if (!passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(null, "Invalid email or password"));
            }
            String jwt = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(jwt, null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(null, "Login failed: " + e.getMessage()));
        }
    }




}
