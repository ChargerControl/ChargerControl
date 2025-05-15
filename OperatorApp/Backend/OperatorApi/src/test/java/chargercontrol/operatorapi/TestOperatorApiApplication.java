package chargercontrol.operatorapi;

import org.springframework.boot.SpringApplication;

public class TestOperatorApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(OperatorApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
