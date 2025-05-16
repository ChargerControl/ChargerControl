package chargercontrol.userapi.controller;

import chargercontrol.userapi.model.AuthResponse;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.service.UserService;
import chargercontrol.userapi.jwt.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private chargercontrol.userapi.repository.UserRepository userRepository;

    @MockBean
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_Success() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("John Doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");

        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());
        Mockito.when(userRepository.save(any(User.class))).thenReturn(user);
        Mockito.when(jwtUtil.generateToken(user.getEmail())).thenReturn("mocked-jwt-token");

        ResultActions result = mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)));

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt").value("mocked-jwt-token"))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    void register_EmailAlreadyExists() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("John Doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");

        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        ResultActions result = mockMvc.perform(post("/apiV1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)));

        result.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.error").value("Email already in use"));
    }
}

