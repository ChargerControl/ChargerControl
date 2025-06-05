package chargercontrol.userapi.dto;

import chargercontrol.userapi.model.User; // Import the User entity
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserDtoTest {

    @Test
    void testNoArgsConstructorAndGettersSetters() {
        UserDTO userDTO = new UserDTO();

        Long testId = 1L;
        String testName = "John Doe";
        String testEmail = "john.doe@example.com";

        userDTO.setId(testId);
        userDTO.setName(testName);
        userDTO.setEmail(testEmail);

        assertEquals(testId, userDTO.getId(), "ID should match the set value");
        assertEquals(testName, userDTO.getName(), "Name should match the set value");
        assertEquals(testEmail, userDTO.getEmail(), "Email should match the set value");
    }

    @Test
    void testAllArgsConstructor() {
        Long testId = 2L;
        String testName = "Jane Smith";
        String testEmail = "jane.smith@example.com";

        UserDTO userDTO = new UserDTO(testId, testName, testEmail);

        assertEquals(testId, userDTO.getId(), "ID should be initialized by all-args constructor");
        assertEquals(testName, userDTO.getName(), "Name should be initialized by all-args constructor");
        assertEquals(testEmail, userDTO.getEmail(), "Email should be initialized by all-args constructor");
    }

    @Test
    void testUserEntityConstructor() {
        User userEntity = new User();
        userEntity.setId(3L);
        userEntity.setName("Alice Wonderland");
        userEntity.setEmail("alice@example.com");
        userEntity.setPassword("hashedPassword123");

        UserDTO userDTO = new UserDTO(userEntity);

        assertEquals(userEntity.getId(), userDTO.getId(), "ID should be mapped from User entity");
        assertEquals(userEntity.getName(), userDTO.getName(), "Name should be mapped from User entity");
        assertEquals(userEntity.getEmail(), userDTO.getEmail(), "Email should be mapped from User entity");
    }

    // This test will now pass IF you add the null check to the UserDTO constructor
    @Test
    void testUserEntityConstructorWithNullUser() {
        UserDTO userDTO = new UserDTO((User) null);

        assertNull(userDTO.getId(), "ID should be null when mapping from null User");
        assertNull(userDTO.getName(), "Name should be null when mapping from null User");
        assertNull(userDTO.getEmail(), "Email should be null when mapping from null User");
    }
}