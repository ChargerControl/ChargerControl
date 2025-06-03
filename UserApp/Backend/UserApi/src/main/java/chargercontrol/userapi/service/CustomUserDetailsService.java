

package chargercontrol.userapi.service;

import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Assuming your User entity has email and password fields
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        User user2 = user.get();

        return new org.springframework.security.core.userdetails.User(
                user.get().getEmail(),
                user.get().getPassword(),
                new ArrayList<>()
        );
    }
}

