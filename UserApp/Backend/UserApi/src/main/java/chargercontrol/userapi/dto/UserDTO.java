package chargercontrol.userapi.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;

    // Construtor para converter de User para UserDTO
    public UserDTO(chargercontrol.userapi.model.User user) {
        if (user != null) { // <--- ADD THIS NULL CHECK
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
        } else {
            // Optionally, you can log a warning or set default nulls explicitly
            this.id = null;
            this.name = null;
            this.email = null;
        }
    }
}