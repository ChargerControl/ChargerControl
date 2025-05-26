package chargercontrol.operatorapi.repository;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import chargercontrol.operatorapi.model.ChargingType;
import chargercontrol.operatorapi.model.Station;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class StationRepositoryTest {

    @Autowired
    private StationRepository stationRepository;

    @Test
    @DisplayName("Should find Station by name")
    void testFindByName() {
        Station station = new Station();
        station.setName("Test Station");
        station.setLocation("Test Location");
        station.setPower(50.0);
        station.setLatitude(10.0);
        station.setLongitude(20.0);
        station.setAvailable(true);
        station.setChargingType(ChargingType.AC);
        stationRepository.save(station);

        var found = stationRepository.findByName("Test Station");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Station");
    }

    @Test
    @DisplayName("Should find Stations by availability")
    void testFindByAvailable() {
        Station s1 = new Station(null, "Station 1", "Loc 1", 40.0, 10.0, 20.0, true, ChargingType.DC, null, null, null);
        Station s2 = new Station(null, "Station 2", "Loc 2", 60.0, 11.0, 21.0, false, ChargingType.AC, null, null, null);
        stationRepository.saveAll(List.of(s1, s2));

        List<Station> availableStations = stationRepository.findByAvailable(true);

        assertThat(availableStations).hasSize(1);
        assertThat(availableStations.get(0).getName()).isEqualTo("Station 1");
    }

    @Test
    @DisplayName("Should find Stations by charging type")
    void testFindByChargingType() {
        Station s1 = new Station(null, "Station A", "Loc A", 40.0, 10.0, 20.0, true, ChargingType.DC, null, null, null);
        Station s2 = new Station(null, "Station B", "Loc B", 60.0, 11.0, 21.0, false, ChargingType.AC, null, null, null);
        stationRepository.saveAll(List.of(s1, s2));

        List<Station> dcStations = stationRepository.findByChargingType(ChargingType.DC);

        assertThat(dcStations).hasSize(1);
        assertThat(dcStations.get(0).getName()).isEqualTo("Station A");
    }

    @Test
    @DisplayName("Should find Stations by availability and charging type")
    void testFindByAvailableAndChargingType() {
        Station s1 = new Station(null, "Station X", "Loc X", 40.0, 10.0, 20.0, true, ChargingType.DC, null, null, null);
        Station s2 = new Station(null, "Station Y", "Loc Y", 60.0, 11.0, 21.0, true, ChargingType.AC, null, null, null);
        Station s3 = new Station(null, "Station Z", "Loc Z", 70.0, 12.0, 22.0, false, ChargingType.DC, null, null, null);
        stationRepository.saveAll(List.of(s1, s2, s3));

        List<Station> result = stationRepository.findByAvailableAndChargingType(true, ChargingType.DC);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Station X");
    }

    @Test
    @DisplayName("Should find Stations by partial location")
    void testFindByLocationContaining() {
        Station s1 = new Station(null, "Station Loc1", "New York City", 40.0, 10.0, 20.0, true, ChargingType.DC, null, null, null);
        Station s2 = new Station(null, "Station Loc2", "Los Angeles", 60.0, 11.0, 21.0, true, ChargingType.AC, null, null, null);
        stationRepository.saveAll(List.of(s1, s2));

        List<Station> nyStations = stationRepository.findByLocationContaining("York");

        assertThat(nyStations).hasSize(1);
        assertThat(nyStations.get(0).getLocation()).contains("York");
    }

    @Test
    @DisplayName("Should find Stations near coordinates within range")
    void testFindStationsNearCoordinates() {
        Station s1 = new Station(null, "Near Station", "Loc", 40.0, 10.0, 20.0, true, ChargingType.DC, null, null, null);
        Station s2 = new Station(null, "Far Station", "Loc", 60.0, 50.0, 60.0, true, ChargingType.AC, null, null, null);
        stationRepository.saveAll(List.of(s1, s2));

        List<Station> nearby = stationRepository.findStationsNearCoordinates(10.0, 20.0, 5.0, 5.0);

        assertThat(nearby).hasSize(1);
        assertThat(nearby.get(0).getName()).isEqualTo("Near Station");
    }
}
