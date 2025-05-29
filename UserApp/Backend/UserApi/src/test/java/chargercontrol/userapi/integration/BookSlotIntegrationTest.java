package chargercontrol.userapi.integration;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import chargercontrol.userapi.model.BookSlot;
import chargercontrol.userapi.model.BookingStatus;
import chargercontrol.userapi.model.Car;
import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.model.User;
import chargercontrol.userapi.repository.BookSlotRepository;
import chargercontrol.userapi.repository.CarRepository;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.StationRepository;
import chargercontrol.userapi.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
@WithMockUser // This annotation provides a mock authenticated user for all tests
class BookSlotIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private ChargingPortRepository chargingPortRepository;

    @Autowired
    private BookSlotRepository bookSlotRepository;

    private User testUser;
    private Car testCar;
    private Station testStation;
    private ChargingPort testPort;
    private BookSlot testBookSlot;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());

        // Create and save test user
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser = userRepository.save(testUser);

        // Create and save test car
        testCar = new Car();
        testCar.setModel("Tesla Model 3");
        testCar.setBrand("Tesla");
        testCar.setOwner(testUser);
        testCar.setCarClass("ELECTRIC");
        testCar.setMaximumCharge(75.0);
        testCar = carRepository.save(testCar);

        // Create and save test station
        testStation = new Station();
        testStation.setName("Test Station");
        testStation = stationRepository.save(testStation);

        // Create and save test charging port
        testPort = new ChargingPort();
        testPort.setStation(testStation);
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);
        testPort.setPortIdentifier("A01");
        testPort = chargingPortRepository.save(testPort);

        // Setup test booking (but don't save it yet)
        testBookSlot = new BookSlot();
        testBookSlot.setUser(testUser);
        testBookSlot.setCar(testCar);
        testBookSlot.setChargingPort(testPort);
        testBookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        testBookSlot.setDuration(60);
        testBookSlot.setStatus(BookingStatus.PENDING);
    }

    /*
@Test
void createBooking_Success() throws Exception {
    // Converte o objeto de teste em JSON
    String bookingJson = objectMapper.writeValueAsString(testBookSlot);

    // Executa uma requisição POST para criar uma nova reserva
    MvcResult result = mockMvc.perform(post("/apiV1/bookings")
                    .contentType(MediaType.APPLICATION_JSON)  // Define o tipo do conteúdo como JSON
                    .content(bookingJson))                    // Corpo da requisição com os dados da reserva
            .andExpect(status().isCreated())                  // Espera um status 201 Created
            .andExpect(jsonPath("$.id").exists())             // Verifica se o ID foi retornado
            .andExpect(jsonPath("$.status").value("PENDING")) // Verifica se o status da reserva é "PENDING"
            .andReturn();                                     // Captura o resultado da requisição

    // Obtém a resposta em JSON e converte de volta para objeto Java
    String responseJson = result.getResponse().getContentAsString();
    BookSlot createdBooking = objectMapper.readValue(responseJson, BookSlot.class);

    // Verifica se o ID da reserva criada não é nulo
    assertNotNull(createdBooking.getId());

    // Compara o horário da reserva criada com o da reserva de teste
    assertEquals(testBookSlot.getBookingTime(), createdBooking.getBookingTime());

    // Compara a duração da reserva criada com a da reserva de teste
    assertEquals(testBookSlot.getDuration(), createdBooking.getDuration());
}
*/


    @Test
    void createBooking_OverlappingTime_Fails() throws Exception {
        // First, create and save a booking
        testBookSlot = bookSlotRepository.save(testBookSlot);

        // Try to create another booking with overlapping time
        BookSlot overlappingBooking = new BookSlot();
        overlappingBooking.setUser(testUser);
        overlappingBooking.setCar(testCar);
        overlappingBooking.setChargingPort(testPort);
        overlappingBooking.setBookingTime(testBookSlot.getBookingTime().plusMinutes(30));
        overlappingBooking.setDuration(60);
        overlappingBooking.setStatus(BookingStatus.PENDING);

        String bookingJson = objectMapper.writeValueAsString(overlappingBooking);

        mockMvc.perform(post("/apiV1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getBookingById_Success() throws Exception {
        testBookSlot = bookSlotRepository.save(testBookSlot);

        mockMvc.perform(get("/apiV1/bookings/{id}", testBookSlot.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testBookSlot.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getBookingsByUserId_Success() throws Exception {
        testBookSlot = bookSlotRepository.save(testBookSlot);

        mockMvc.perform(get("/apiV1/bookings/user/{userId}", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testBookSlot.getId()))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void updateBookingStatus_Success() throws Exception {
        testBookSlot = bookSlotRepository.save(testBookSlot);

        mockMvc.perform(put("/apiV1/bookings/{id}/status", testBookSlot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"ACTIVE\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void cancelBooking_Success() throws Exception {
        testBookSlot = bookSlotRepository.save(testBookSlot);

        mockMvc.perform(delete("/apiV1/bookings/{id}", testBookSlot.getId()))
                .andExpect(status().isNoContent());

        BookSlot cancelledBooking = bookSlotRepository.findById(testBookSlot.getId()).orElseThrow();
        assertEquals(BookingStatus.CANCELLED, cancelledBooking.getStatus());
    }

    @Test
    void getBookingsByStationIdAndRange_Success() throws Exception {
        testBookSlot = bookSlotRepository.save(testBookSlot);

        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = startTime.plusHours(2);

        mockMvc.perform(get("/apiV1/bookings/station/{chargingPortId}/range", testPort.getId())
                        .param("startTime", startTime.toString())
                        .param("endTime", endTime.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testBookSlot.getId()));
    }

    @Test
    void completeBooking_CalculatesEnergyUsed() throws Exception {
        testBookSlot.setStatus(BookingStatus.ACTIVE);
        testBookSlot = bookSlotRepository.save(testBookSlot);

        double initialEnergyUsed = testPort.getEnergyUsed();

        mockMvc.perform(put("/apiV1/bookings/{id}/status", testBookSlot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"COMPLETED\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        ChargingPort updatedPort = chargingPortRepository.findById(testPort.getId()).orElseThrow();
        assertTrue(updatedPort.getEnergyUsed() > initialEnergyUsed);
    }

    /*
@Test
void updateBookingStatus_InvalidTransition_Fails() throws Exception {
    testBookSlot.setStatus(BookingStatus.CANCELLED);
    testBookSlot = bookSlotRepository.save(testBookSlot);

    mockMvc.perform(put("/apiV1/bookings/{id}/status", testBookSlot.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("\"ACTIVE\""))
            .andExpect(status().isBadRequest());
}
*/


    @Test
    void cancelBooking_PastBookingTime_Fails() throws Exception {
        // Save the booking with a future time
        testBookSlot = bookSlotRepository.save(testBookSlot);

        // Use raw SQL to bypass validation and simulate a past booking time
        jdbcTemplate.update("UPDATE book_slots SET booking_time = ? WHERE id = ?",
                LocalDateTime.now().minusHours(2), testBookSlot.getId());

        // Ensure JPA reflects the changes
        entityManager.clear(); // optional but avoids stale state

        // Try cancelling the booking (should fail due to past time)
        mockMvc.perform(delete("/apiV1/bookings/{id}", testBookSlot.getId()))
                .andExpect(status().isNotFound());
    }


}
