package chargercontrol.userapi.controller;

import chargercontrol.userapi.model.*;
import chargercontrol.userapi.service.BookSlotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.EntityNotFoundException; // Import specific exception
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
import java.util.Map;
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
    private Station testStation; // Added for completeness

    private BookRequest validBookRequest; // Added to hold a valid request for success tests

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(bookSlotController).build();

        testStation = new Station();
        testStation.setId(1L);
        testStation.setName("Test Station");

        testPort = new ChargingPort();
        testPort.setId(TEST_PORT_ID);
        testPort.setStation(testStation); // Link to station
        testPort.setStatus(ChargingPortStatus.AVAILABLE);
        testPort.setEnergyUsed(0.0);
        testPort.setPortIdentifier("A01");

        testCar = new Car();
        testCar.setId(TEST_CAR_ID);
        testCar.setModel("Tesla Model 3");
        testCar.setMaximumCharge(75.0);

        testUser = new User();
        testUser.setId(TEST_USER_ID);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");

        testBookSlot = new BookSlot();
        testBookSlot.setId(TEST_BOOKING_ID);
        testBookSlot.setUser(testUser);
        testBookSlot.setCar(testCar);
        testBookSlot.setChargingPort(testPort);
        testBookSlot.setBookingTime(LocalDateTime.now().plusHours(1));
        testBookSlot.setDuration(60);
        testBookSlot.setStatus(BookingStatus.PENDING);

        // Initialize a fully VALID BookRequest here for reuse
        validBookRequest = new BookRequest();
        validBookRequest.setUserId(TEST_USER_ID);
        validBookRequest.setCarId(TEST_CAR_ID);
        validBookRequest.setStartTime(LocalDateTime.now().plusHours(1));
        validBookRequest.setDuration(60);
        validBookRequest.setStationId(testStation.getId()); // Set a valid station ID
    }


    @Test
    void createBooking_Success() throws Exception {
        // Use the validBookRequest initialized in setUp
        when(bookSlotService.createBookingWithValidation(any(BookRequest.class))).thenReturn(testBookSlot);

        mockMvc.perform(post("/apiV1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validBookRequest))) // Use validBookRequest
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(bookSlotService, times(1)).createBookingWithValidation(any(BookRequest.class));
    }

    @Test
    void createBooking_ValidationError() throws Exception {
        BookRequest bookRequest = new BookRequest();
        bookRequest.setUserId(TEST_USER_ID);
        bookRequest.setCarId(TEST_CAR_ID);
        // Missing startTime, duration, and stationId to trigger validation error

        mockMvc.perform(post("/apiV1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isBadRequest());

        verify(bookSlotService, never()).createBookingWithValidation(any(BookRequest.class));
    }

    @Test
    void getBookingById_Success() throws Exception {
        when(bookSlotService.getBookingById(TEST_BOOKING_ID)).thenReturn(Optional.of(testBookSlot));

        mockMvc.perform(get("/apiV1/bookings/{id}", TEST_BOOKING_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(bookSlotService, times(1)).getBookingById(TEST_BOOKING_ID);
    }

    @Test
    void getBookingById_NotFound() throws Exception {
        when(bookSlotService.getBookingById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/apiV1/bookings/{id}", 999L))
                .andExpect(status().isNotFound());

        verify(bookSlotService, times(1)).getBookingById(999L);
    }

    @Test
    void getBookingsByUserId_Success() throws Exception {
        when(bookSlotService.getBookingsByUserId(TEST_USER_ID))
                .thenReturn(Arrays.asList(testBookSlot));

        mockMvc.perform(get("/apiV1/bookings/user/{userId}", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$[0].user.id").value(TEST_USER_ID));

        verify(bookSlotService, times(1)).getBookingsByUserId(TEST_USER_ID);
    }

    @Test
    void getBookingsByStationId_Success() throws Exception {
        when(bookSlotService.getBookingsByChargingPortId(TEST_PORT_ID))
                .thenReturn(Arrays.asList(testBookSlot));

        mockMvc.perform(get("/apiV1/bookings/station/{chargingPortId}", TEST_PORT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$[0].chargingPort.id").value(TEST_PORT_ID));

        verify(bookSlotService, times(1)).getBookingsByChargingPortId(TEST_PORT_ID);
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

        verify(bookSlotService, times(1)).getBookingsByChargingPortIdAndTimeRange(
                eq(TEST_PORT_ID), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void updateBookingStatus_Success() throws Exception {
        BookSlot updatedBooking = new BookSlot();
        updatedBooking.setId(TEST_BOOKING_ID);
        updatedBooking.setStatus(BookingStatus.COMPLETED);

        Map<String, String> statusUpdate = Map.of("status", BookingStatus.COMPLETED.name());
        String requestBody = objectMapper.writeValueAsString(statusUpdate);

        when(bookSlotService.updateBookingStatus(eq(TEST_BOOKING_ID), any(BookingStatus.class)))
                .thenReturn(updatedBooking);

        mockMvc.perform(put("/apiV1/bookings/{id}/status", TEST_BOOKING_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_BOOKING_ID))
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        verify(bookSlotService).updateBookingStatus(eq(TEST_BOOKING_ID), eq(BookingStatus.COMPLETED));
    }


    @Test
    void updateBookingStatus_NotFound() throws Exception {
        Long nonExistentBookingId = 999L;
        BookingStatus newStatus = BookingStatus.COMPLETED;

        Map<String, String> statusUpdate = Map.of("status", newStatus.name());
        String requestBody = objectMapper.writeValueAsString(statusUpdate);

        // Assuming your controller handles RuntimeException for updateBookingStatus as well
        // If it catches EntityNotFoundException specifically, change this to EntityNotFoundException
        when(bookSlotService.updateBookingStatus(eq(nonExistentBookingId), eq(newStatus)))
                .thenThrow(new EntityNotFoundException("Booking not found")); // Using EntityNotFoundException is more precise

        mockMvc.perform(put("/apiV1/bookings/{id}/status", nonExistentBookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound()); // Expect 404 Not Found as EntityNotFoundException is handled globally or via specific catch
        // If your controller method for updateBookingStatus uses a generic `catch (RuntimeException e)`,
        // and returns HttpStatus.BAD_REQUEST for it, then assert status().isBadRequest()
        // But for "not found", 404 is semantically correct.

        verify(bookSlotService).updateBookingStatus(eq(nonExistentBookingId), eq(newStatus));
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
        // If your service throws EntityNotFoundException, then the controller should catch it and return 404
        doThrow(new EntityNotFoundException("Booking not found")).when(bookSlotService).cancelBooking(bookingId);

        mockMvc.perform(delete("/apiV1/bookings/{id}", bookingId))
                .andExpect(status().isNotFound());

        verify(bookSlotService).cancelBooking(bookingId);
    }
}