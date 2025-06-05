
package chargercontrol.userapi.controller;

import chargercontrol.userapi.jwt.JwtUtil;
import chargercontrol.userapi.model.AuthRequest;
import chargercontrol.userapi.model.RegisterRequest;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import chargercontrol.userapi.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper;
    private User testUser;
    private AuthRequest testAuthRequest;
    private RegisterRequest testRegisterRequest;
    private static final String TEST_JWT = "test.jwt.token";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();

        testRegisterRequest = new RegisterRequest();
        testRegisterRequest.setEmail("test@example.com");
        testRegisterRequest.setPassword("password123");
        testRegisterRequest.setName("Test User");

        testUser = new User();
        testUser.setEmail(testRegisterRequest.getEmail());
        testUser.setPassword("encodedPassword");
        testUser.setName(testRegisterRequest.getName());

        testAuthRequest = new AuthRequest();
        testAuthRequest.setEmail("test@example.com");
        testAuthRequest.setPassword("password123");
    }

    @Test
    void registerSuccess() throws Exception {
        when(userRepository.findByEmail(testRegisterRequest.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any(String.class))).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testRegisterRequest.getEmail())).thenReturn(TEST_JWT);

        mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRegisterRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt").value(TEST_JWT))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    void registerFailureEmailExists() throws Exception {
        when(userRepository.findByEmail(testRegisterRequest.getEmail())).thenReturn(Optional.of(testUser));

        mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRegisterRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.error").value("Email already in use"));
    }

    @Test
    void registerFailureValidationException() throws Exception {
        testRegisterRequest.setEmail("");  // Invalid email to trigger validation

        mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRegisterRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerFailureGeneralException() throws Exception {
        when(userRepository.findByEmail(any(String.class))).thenReturn(Optional.empty());

        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRegisterRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.error").value("Registration failed: Database error"));
    }

    @Test
    void loginSuccess() throws Exception {
        when(userService.getUserByEmail(testAuthRequest.getEmail())).thenReturn(testUser);
        when(passwordEncoder.matches(testAuthRequest.getPassword(), testUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(testUser.getEmail())).thenReturn(TEST_JWT);

        mockMvc.perform(post("/apiV1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAuthRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt").value(TEST_JWT))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    void loginFailureInvalidCredentials() throws Exception {
        when(userService.getUserByEmail(testAuthRequest.getEmail())).thenReturn(testUser);
        when(passwordEncoder.matches(testAuthRequest.getPassword(), testUser.getPassword())).thenReturn(false);

        mockMvc.perform(post("/apiV1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAuthRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    void loginFailureUserNotFound() throws Exception {
        when(userService.getUserByEmail(testAuthRequest.getEmail())).thenReturn(null);

        mockMvc.perform(post("/apiV1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAuthRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    void loginFailureInternalServerError() throws Exception {
        when(userService.getUserByEmail(any(String.class))).thenThrow(new RuntimeException("Database connection failed"));

        mockMvc.perform(post("/apiV1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAuthRequest)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.error").value("Login failed: Database connection failed"));
    }
}
