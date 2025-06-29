package chargercontrol.userapi;

import org.springframework.boot.SpringApplication;

public class TestUserApiApplication {

    public static void main(String[] args) {
        SpringApplication.from(UserApiApplication::main)
                .with(TestUserApiApplication.class).run(args);

    }

}
