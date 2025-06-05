package chargercontrol.userapi.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;

@DataJpaTest
@TestPropertySource(locations = "classpath:application-test.properties")
class ChargingPortRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ChargingPortRepository chargingPortRepository;

    private Station testStation;
    private ChargingPort testPort1;
    private ChargingPort testPort2;

    @BeforeEach
    void setUp() {
        // Create and persist test station
        testStation = new Station();
        testStation.setName("Test Station");
        testStation = entityManager.persist(testStation);

        // Create and persist first charging port
        testPort1 = new ChargingPort();
        testPort1.setStation(testStation);
        testPort1.setStatus(ChargingPortStatus.AVAILABLE);
        testPort1.setEnergyUsed(0.0);
        testPort1.setPortIdentifier("A01");
        testPort1 = entityManager.persist(testPort1);

        // Create and persist second charging port with different status
        testPort2 = new ChargingPort();
        testPort2.setStation(testStation);
        testPort2.setStatus(ChargingPortStatus.CHARGING);
        testPort2.setEnergyUsed(10.0);
        testPort2.setPortIdentifier("A02");
        testPort2 = entityManager.persist(testPort2);

        entityManager.flush();
    }

}
