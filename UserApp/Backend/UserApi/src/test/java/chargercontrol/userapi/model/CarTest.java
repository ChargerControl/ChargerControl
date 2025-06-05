package chargercontrol.userapi.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CarTest {

    private Car car;
    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Test User");
        owner.setEmail("testuser@example.com");

        car = new Car();
        car.setId(1L);
        car.setModel("Model S");
        car.setBrand("Tesla");
        car.setMaximumCharge(100.0);
        car.setCarClass("LUXURY");
        car.setOwner(owner);
        car.setImageUrl("http://example.com/tesla.png");
    }

    @Test
    void testCarAttributes() {
        assertEquals(1L, car.getId());
        assertEquals("Model S", car.getModel());
        assertEquals("Tesla", car.getBrand());
        assertEquals(100.0, car.getMaximumCharge());
        assertEquals("LUXURY", car.getCarClass());
        assertEquals(owner, car.getOwner());
        assertEquals("http://example.com/tesla.png", car.getImageUrl());
    }

    @Test
    void testCarOwner() {
        assertNotNull(car.getOwner());
        assertEquals("Test User", car.getOwner().getName());
    }

    @Test
    void testCarEquality() {
        Car anotherCar = new Car();
        anotherCar.setId(1L);
        anotherCar.setModel("Model S");
        anotherCar.setBrand("Tesla");
        anotherCar.setMaximumCharge(100.0);
        anotherCar.setCarClass("LUXURY");
        anotherCar.setOwner(owner);
        anotherCar.setImageUrl("http://example.com/tesla.png");

        assertEquals(car, anotherCar);
    }
}