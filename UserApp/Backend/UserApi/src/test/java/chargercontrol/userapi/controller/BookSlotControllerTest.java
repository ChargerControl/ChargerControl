package chargercontrol.userapi.controller;

import chargercontrol.userapi.model.*;
import chargercontrol.userapi.service.BookSlotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookSlotControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BookSlotService bookSlotService;

    @InjectMocks
    private BookSlotController bookSlotController;

    private ObjectMapper objectMapper;
    private BookSlot testBookSlot;
    private static final Long TEST_BOOKING_ID = 1L;
    private static final Long TEST_USER_ID = 1L;
    private static final Long TEST_PORT_ID = 1L;
    private static final Long TEST_CAR_ID = 1L;
    private User testUser;
    private Car testCar;
    private ChargingPort testPort;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(bookSlotController).build();

        // Create test station for charging port
        Station testStation = new Station();
        testStation.setId(1L);
        testStation.setName("Test Station");

        // Create test charging port
        testPort = new ChargingPort();
        testPort.setId(TEST_PORT_ID);
        testPort.setStation(testStation);
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);
        testPort.setPortIdentifier("A01");

        // Create test car
        testCar = new Car();
        testCar.setId(TEST_CAR_ID);
        testCar.setModel("Tesla Model 3");
        testCar.setMaximumCharge(75.0);


        // Create test user
        testUser = new User();
        testUser.setId(TEST_USER_ID);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");

        // Create test booking
        testBookSlot = new BookSlot();
        testBookSlot.setId(TEST_BOOKING_ID);
        testBookSlot.setUser(testUser);
        testBookSlot.setCar(testCar);
        testBookSlot.setChargingPort(testPort);
        testBookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        testBookSlot.setDuration(60); // 1 hour in minutes
        testBookSlot.setStatus(BookingStatus.PENDING);
    }

    @Test
    void createBooking_Success() throws Exception {
        when(bookSlotService.createBooking(any(BookSlot.class))).thenReturn(testBookSlot);

        mockMvc.perform(post("/apiV1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBookSlot)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$.user.id").value(TEST_USER_ID))
                .andExpect(jsonPath("$.car.id").value(TEST_CAR_ID))
                .andExpect(jsonPath("$.chargingPort.id").value(TEST_PORT_ID))
                .andExpect(jsonPath("$.duration").value(60))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createBooking_ValidationFailure() throws Exception {
        testBookSlot.setBookingTime(null); // Invalid booking data

        mockMvc.perform(post("/apiV1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBookSlot)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getBookingById_Success() throws Exception {
        when(bookSlotService.getBookingById(TEST_BOOKING_ID)).thenReturn(Optional.of(testBookSlot));

        mockMvc.perform(get("/apiV1/bookings/{id}", TEST_BOOKING_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getBookingById_NotFound() throws Exception {
        when(bookSlotService.getBookingById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/apiV1/bookings/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void getBookingsByUserId_Success() throws Exception {
        when(bookSlotService.getBookingsByUserId(TEST_USER_ID))
                .thenReturn(Arrays.asList(testBookSlot));

        mockMvc.perform(get("/apiV1/bookings/user/{userId}", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$[0].user.id").value(TEST_USER_ID));
    }

    @Test
    void getBookingsByStationId_Success() throws Exception {
        when(bookSlotService.getBookingsByChargingPortId(TEST_PORT_ID))
                .thenReturn(Arrays.asList(testBookSlot));

        mockMvc.perform(get("/apiV1/bookings/station/{chargingPortId}", TEST_PORT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$[0].chargingPort.id").value(TEST_PORT_ID));
    }

    @Test
    void getBookingsByStationIdAndRange_Success() throws Exception {
        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = startTime.plusHours(24);

        when(bookSlotService.getBookingsByChargingPortIdAndTimeRange(
                eq(TEST_PORT_ID), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(testBookSlot));

        mockMvc.perform(get("/apiV1/bookings/station/{charginPortId}/range", TEST_PORT_ID)
                .param("startTime", startTime.toString())
                .param("endTime", endTime.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$[0].chargingPort.id").value(TEST_PORT_ID));
    }

    @Test
    void updateBookingStatus_Success() throws Exception {
        BookSlot updatedBooking = new BookSlot();
        updatedBooking.setId(TEST_BOOKING_ID);
        updatedBooking.setStatus(BookingStatus.COMPLETED);

        when(bookSlotService.updateBookingStatus(eq(TEST_BOOKING_ID), any(BookingStatus.class)))
                .thenReturn(updatedBooking);

        mockMvc.perform(put("/apiV1/bookings/{id}/status", TEST_BOOKING_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(BookingStatus.COMPLETED)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void updateBookingStatus_NotFound() throws Exception {
        when(bookSlotService.updateBookingStatus(eq(999L), any(BookingStatus.class)))
                .thenThrow(new RuntimeException("Booking not found"));

        mockMvc.perform(put("/apiV1/bookings/{id}/status", 999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(BookingStatus.COMPLETED)))
                .andExpect(status().isNotFound());
    }

    @Test
    void cancelBooking_Success() throws Exception {
        Long bookingId = 1L;
        doNothing().when(bookSlotService).cancelBooking(bookingId);

        mockMvc.perform(delete("/apiV1/bookings/{id}", bookingId))
                .andExpect(status().isNoContent());

        verify(bookSlotService).cancelBooking(bookingId);
    }

    @Test
    void cancelBooking_NotFound() throws Exception {
        Long bookingId = 999L;
        doThrow(new RuntimeException("Booking not found")).when(bookSlotService).cancelBooking(bookingId);

        mockMvc.perform(delete("/apiV1/bookings/{id}", bookingId))
                .andExpect(status().isNotFound());

        verify(bookSlotService).cancelBooking(bookingId);
    }
}
