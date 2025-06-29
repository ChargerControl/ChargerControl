package chargercontrol.userapi.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.TestPropertySource;

import chargercontrol.userapi.model.BookSlot;
import chargercontrol.userapi.model.BookingStatus;
import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.model.User;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(locations = "classpath:application-test.properties")
class BookSlotRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookSlotRepository bookSlotRepository;

    private User testUser;
    private Car testCar;
    private Station testStation;
    private ChargingPort testPort;
    private BookSlot testBookSlot;

    @BeforeEach
    void setUp() {
        // Create and persist test user
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        entityManager.persist(testUser);

        // Create and persist test car
        testCar = new Car();
        testCar.setModel("Model 3");
        testCar.setBrand("Tesla");
        testCar.setOwner(testUser);
        testCar.setCarClass("ELECTRIC");
        testCar.setMaximumCharge(75.0);
        entityManager.persist(testCar);

        // Create and persist test station
        testStation = new Station();
        testStation.setName("Test Station");
        entityManager.persist(testStation);

        // Create and persist test charging port
        testPort = new ChargingPort();
        testPort.setStation(testStation);
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);
        testPort.setPortIdentifier("A01");
        entityManager.persist(testPort);

        // Create test booking but don't persist it yet (individual tests will do this)
        testBookSlot = new BookSlot();
        testBookSlot.setUser(testUser);
        testBookSlot.setCar(testCar);
        testBookSlot.setChargingPort(testPort);
        testBookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        testBookSlot.setDuration(60); // 1 hour in minutes
        testBookSlot.setStatus(BookingStatus.PENDING);

        entityManager.flush();
    }

   




}
