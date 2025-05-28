package chargercontrol.userapi.controller;

import chargercontrol.userapi.jwt.JwtUtil;
import chargercontrol.userapi.model.AuthRequest;
import chargercontrol.userapi.model.AuthResponse;
import chargercontrol.userapi.model.RegisterRequest;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import chargercontrol.userapi.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController // Changed from @Service to @RestController for Spring Web to recognize it as a
                // controller
@RequestMapping("/apiV1/user")
@Tag(name = "User Authentication", description = "APIs for user registration and login")
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
    @Operation(summary = "Register a new user",
              requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                  description = "User registration details",
                  required = true,
                  content = @Content(mediaType = "application/json",
                                   schema = @Schema(implementation = RegisterRequest.class))
              ),
              responses = {
                  @ApiResponse(responseCode = "200",
                             description = "User registered successfully",
                             content = @Content(mediaType = "application/json",
                                             schema = @Schema(implementation = AuthResponse.class))),
                  @ApiResponse(responseCode = "400",
                             description = "Registration failed or email already in use",
                             content = @Content(mediaType = "application/json",
                                             schema = @Schema(implementation = AuthResponse.class)))
              })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Check if email already exists

            if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(null, "Email already in use"));
            }

            User user = new User();
            user.setEmail(registerRequest.getEmail());
            user.setName(registerRequest.getName());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

            User savedUser = userRepository.save(user);
            String jwt = jwtUtil.generateToken(savedUser.getEmail());

            return ResponseEntity.ok(new AuthResponse(jwt, null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login an existing user", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "User credentials for login", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthRequest.class))), responses = {
            @ApiResponse(responseCode = "200", description = "Login successful", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid email or password", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "500", description = "Login failed due to server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    })
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authenticationRequest) {
        try {
            User user = userService.getUserByEmail(authenticationRequest.getEmail());

            if (user == null || !passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(null, "Invalid email or password"));
            }

            String jwt = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(jwt, null));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(null, "Invalid email or password"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(null, "Login failed: " + e.getMessage()));
        }
    }
}
