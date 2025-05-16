package chargercontrol.userapi.repository;

import chargercontrol.userapi.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

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
}
