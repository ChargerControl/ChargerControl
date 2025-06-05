package chargercontrol.userapi.service;

import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository; // Mock the UserRepository dependency

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService; // Inject mocks into the service under test

    private User testUser;
    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_PASSWORD = "password123";

    @BeforeEach
    void setUp() {
        // Initialize mocks before each test
        MockitoAnnotations.openMocks(this);

        // Setup a common test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail(TEST_EMAIL);
        testUser.setPassword(TEST_PASSWORD); // In a real app, this would be encoded
        testUser.setName("testuser");
        // Add other necessary user properties if they are used by UserDetails conversion
    }

    @Test
    void loadUserByUsername_userFound_returnsUserDetails() {
        // Mock the repository to return the test user when findByEmail is called
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(TEST_EMAIL);

        assertNotNull(userDetails);
        assertEquals(TEST_EMAIL, userDetails.getUsername()); // UserDetails.getUsername() usually maps to email
        assertEquals(TEST_PASSWORD, userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().isEmpty()); // Assuming no roles/authorities for now

        // Verify that findByEmail was called exactly once with the correct email
        verify(userRepository, times(1)).findByEmail(TEST_EMAIL);
    }

    @Test
    void loadUserByUsername_userNotFound_throwsUsernameNotFoundException() {
        // Mock the repository to return empty Optional, simulating user not found
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Assert that calling loadUserByUsername throws UsernameNotFoundException
        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () ->
                customUserDetailsService.loadUserByUsername("nonexistent@example.com"));

        // Verify the exception message
        assertEquals("User not found with email: nonexistent@example.com", exception.getMessage());

        // Verify that findByEmail was called
        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    void loadUserByUsername_nullEmail_throwsUsernameNotFoundException() {
        // Depending on actual userRepository.findByEmail implementation,
        // it might return empty for null or throw an NPE.
        // Mock it to return empty to align with the service's not-found logic.
        when(userRepository.findByEmail(isNull())).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () ->
                customUserDetailsService.loadUserByUsername(null));

        assertEquals("User not found with email: null", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(null);
    }
}