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
    // Não incluímos password por segurança
    // Não incluímos cars para evitar lazy loading
    
    // Construtor para converter de User para UserDTO
    public UserDTO(chargercontrol.userapi.model.User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
    }
}