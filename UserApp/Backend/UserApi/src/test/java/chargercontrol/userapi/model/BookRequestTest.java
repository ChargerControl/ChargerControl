// package chargercontrol.userapi.model;

// import org.junit.jupiter.api.Test;
// import java.time.LocalDateTime;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.assertj.core.api.Assertions.assertThat;

// class BookRequestTest {

//     @Test
//     void testNoArgsConstructorAndGetters() {
//         BookRequest request = new BookRequest();

//         assertNull(request.getJwtToken());
//         assertNull(request.getStartTime());
//         assertNull(request.getStationId());
//         assertNull(request.getCarId());
//         assertNull(request.getDuration());
//     }

//     @Test
//     void testSetAndGetValues() {
//         String testJwt = "test.jwt.token";
//         LocalDateTime testStartTime = LocalDateTime.of(2025, 12, 25, 10, 0);
//         Long testStationId = 1L;
//         Long testCarId = 101L;
//         Integer testDuration = 60;

//         BookRequest requestWithValues = new BookRequest(testJwt, testStartTime, testStationId, testCarId, testDuration);

//         assertThat(requestWithValues.getJwtToken()).isEqualTo(testJwt);
//         assertThat(requestWithValues.getStartTime()).isEqualTo(testStartTime);
//         assertThat(requestWithValues.getStationId()).isEqualTo(testStationId);
//         assertThat(requestWithValues.getCarId()).isEqualTo(testCarId);
//         assertThat(requestWithValues.getDuration()).isEqualTo(testDuration);
//     }

//     @Test
//     void testExplicitGetters() {
//         LocalDateTime now = LocalDateTime.now();
//         BookRequest request = new BookRequest("dummy.jwt", now, 2L, 202L, 120);

//         assertEquals(2L, request.getStationId());
//         assertEquals(202L, request.getCarId());
//         assertEquals(120, request.getDuration());
//     }
// }