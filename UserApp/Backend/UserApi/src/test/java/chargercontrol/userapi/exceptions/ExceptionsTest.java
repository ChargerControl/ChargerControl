package chargercontrol.userapi.exceptions;

import chargercontrol.userapi.exception.AuthenticationFailedException;
import chargercontrol.userapi.exception.EmailAlreadyExistsException;
import chargercontrol.userapi.exception.GlobalExceptionHandler;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ExceptionsTest { // Renamed to "ExceptionTests" to encompass all

    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    // --- Custom Exception Class Tests ---

    @Test
    void testEmailAlreadyExistsExceptionCreation() {
        String message = "test@example.com already registered.";
        EmailAlreadyExistsException exception = new EmailAlreadyExistsException(message);

        // Verify the exception type and message
        assertNotNull(exception, "Exception should not be null");
        assertEquals(message, exception.getMessage(), "Exception message should match");
        assertTrue(exception instanceof RuntimeException, "Exception should be a RuntimeException");
    }

    @Test
    void testAuthenticationFailedExceptionCreation() {
        String message = "Invalid credentials provided.";
        AuthenticationFailedException exception = new AuthenticationFailedException(message);

        // Verify the exception type and message
        assertNotNull(exception, "Exception should not be null");
        assertEquals(message, exception.getMessage(), "Exception message should match");
        assertTrue(exception instanceof RuntimeException, "Exception should be a RuntimeException");
    }

    // --- GlobalExceptionHandler Tests ---

    @Test
    void testHandleEntityNotFoundException() {
        String errorMessage = "User with ID 123 not found";
        EntityNotFoundException ex = new EntityNotFoundException(errorMessage);

        ResponseEntity<String> response = globalExceptionHandler.handleEntityNotFoundException(ex);

        // Verify HTTP Status and Response Body
        assertNotNull(response, "Response should not be null");
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode(), "Status code should be NOT_FOUND");
        assertEquals(errorMessage, response.getBody(), "Response body should contain the exception message");
    }


}