package chargercontrol.userapi.repository;

import chargercontrol.userapi.model.User;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_Success() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");
        entityManager.persist(user);
        entityManager.flush();

        Optional<User> found = userRepository.findByEmail("john.doe@example.com");

        assertTrue(found.isPresent());
        assertEquals("john.doe@example.com", found.get().getEmail());
        assertEquals("John Doe", found.get().getName());
    }

    @Test
    void findByEmail_NotFound() {
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");
        assertFalse(found.isPresent());
    }

    @Test
    void saveUser_Success() {
        User user = new User();
        user.setName("Jane Doe");
        user.setEmail("jane.doe@example.com");
        user.setPassword("password123");

        User savedUser = userRepository.save(user);
        User foundUser = entityManager.find(User.class, savedUser.getId());

        assertNotNull(foundUser);
        assertEquals("jane.doe@example.com", foundUser.getEmail());
        assertEquals("Jane Doe", foundUser.getName());
    }

    @Test
    void deleteUser_Success() {
        User user = new User();
        user.setName("Bob Smith");
        user.setEmail("bob.smith@example.com");
        user.setPassword("password123");
        entityManager.persist(user);
        entityManager.flush();

        userRepository.deleteById(user.getId());

        User foundUser = entityManager.find(User.class, user.getId());
        assertNull(foundUser);
    }

    @Test
    void findById_Success() {
        User user = new User();
        user.setName("Alice Johnson");
        user.setEmail("alice.johnson@example.com");
        user.setPassword("password123");
        entityManager.persist(user);
        entityManager.flush();

        Optional<User> found = userRepository.findById(user.getId());

        assertTrue(found.isPresent());
        assertEquals("alice.johnson@example.com", found.get().getEmail());
        assertEquals("Alice Johnson", found.get().getName());
    }

    @Test
    void saveUser_DuplicateEmail() {
        // First user
        User user1 = new User();
        user1.setName("John Doe");
        user1.setEmail("duplicate@example.com");
        user1.setPassword("password123");
        entityManager.persist(user1);
        entityManager.flush();

        // Second user with same email
        User user2 = new User();
        user2.setName("Jane Doe");
        user2.setEmail("duplicate@example.com");
        user2.setPassword("password456");

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.save(user2);
            entityManager.flush();
        });
    }

    @Test
    void saveUser_NullEmail() {
        User user = new User();
        user.setName("John Doe");
        user.setPassword("password123");
        // email is null

        assertThrows(ConstraintViolationException.class, () -> {
            userRepository.save(user);
            entityManager.flush();
        });
    }

    @Test
    void saveUser_EmptyEmail() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("");
        user.setPassword("password123");

        assertThrows(ConstraintViolationException.class, () -> {
            userRepository.save(user);
            entityManager.flush();
        });
    }

    @Test
    void saveUser_InvalidEmail() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("not-an-email");
        user.setPassword("password123");

        assertThrows(ConstraintViolationException.class, () -> {
            userRepository.save(user);
            entityManager.flush();
        });
    }

    @Test
    void deleteById_NonExistent() {
        assertDoesNotThrow(() -> userRepository.deleteById(999L));
    }

    @Test
    void updateUser_Success() {
        User user = new User();
        user.setName("Original Name");
        user.setEmail("original@example.com");
        user.setPassword("password123");
        entityManager.persist(user);
        entityManager.flush();

        user.setName("Updated Name");
        User updatedUser = userRepository.save(user);
        entityManager.flush();

        User foundUser = entityManager.find(User.class, user.getId());
        assertEquals("Updated Name", foundUser.getName());
        assertEquals("original@example.com", foundUser.getEmail());
    }

    @Test
    void updateUser_InvalidData() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPassword("password123");
        entityManager.persist(user);
        entityManager.flush();

        user.setEmail("");  // Invalid email

        assertThrows(ConstraintViolationException.class, () -> {
            userRepository.save(user);
            entityManager.flush();
        });
    }

    @Test
    void findByEmail_CaseInsensitive() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("John.Doe@Example.com");
        user.setPassword("password123");
        entityManager.persist(user);
        entityManager.flush();

        Optional<User> found = userRepository.findByEmail("john.doe@example.com");
        assertTrue(found.isPresent());
        assertEquals("John.Doe@Example.com", found.get().getEmail());
    }
}
