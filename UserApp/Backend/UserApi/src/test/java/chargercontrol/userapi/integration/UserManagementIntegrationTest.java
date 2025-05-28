package chargercontrol.userapi.integration;

import chargercontrol.userapi.UserApiApplication;
import chargercontrol.userapi.config.TestSecurityConfig;
import chargercontrol.userapi.model.AuthRequest;
import chargercontrol.userapi.model.RegisterRequest;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = {UserApiApplication.class, TestSecurityConfig.class},
        properties = "spring.main.allow-bean-definition-overriding=true"
)
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class UserManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void cleanup() {
        userRepository.deleteAll();
    }

    @Test
    public void fullRegistrationAndLoginFlow() throws Exception {
        String uniqueEmail = "testuser" + UUID.randomUUID() + "@example.com";


        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail(uniqueEmail);
        registerRequest.setPassword("password123");

        // Perform registration
        mockMvc.perform(post("/apiV1/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk()) // Now expects 200
                .andExpect(jsonPath("$.jwt").isNotEmpty());

        // Perform login
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail(uniqueEmail);
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/apiV1/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt").isNotEmpty());
    }

    @Test
    void registerWithExistingEmail() throws Exception {
        // Create initial user
        User existingUser = new User();
        existingUser.setName("Existing User");
        existingUser.setEmail("existing@example.com");
        existingUser.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(existingUser);

        // Try to register with same email
        User newUser = new User();
        newUser.setName("New User");
        newUser.setEmail("existing@example.com");
        newUser.setPassword("newpassword123");

        mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already in use"));

        // Verify only one user exists with this email
        assertEquals(1, userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals("existing@example.com"))
                .count());
    }

    @Test
    void loginWithInvalidCredentials() throws Exception {
        // Create a user
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        // Try wrong password
        AuthRequest wrongPasswordRequest = new AuthRequest();
        wrongPasswordRequest.setEmail("test@example.com");
        wrongPasswordRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/apiV1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPasswordRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));

        // Try non-existent email
        AuthRequest wrongEmailRequest = new AuthRequest();
        wrongEmailRequest.setEmail("nonexistent@example.com");
        wrongEmailRequest.setPassword("password123");

        mockMvc.perform(post("/apiV1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongEmailRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    void registerWithInvalidData() throws Exception {
        // Try to register with empty email
        User invalidUser = new User();
        invalidUser.setName("Test User");
        invalidUser.setPassword("password123");

        mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest());

        // Verify no user was created
        assertEquals(0, userRepository.count());

        // Try to register with empty password
        invalidUser = new User();
        invalidUser.setName("Test User");
        invalidUser.setEmail("test@example.com");

        mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest());

        // Verify no user was created
        assertEquals(0, userRepository.count());
    }
}
