package chargercontrol.userapi.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String jwt;
    private String error;

    public AuthResponse(String jwt, String error) {
        this.jwt = jwt;
        this.error = error;
    }

}
