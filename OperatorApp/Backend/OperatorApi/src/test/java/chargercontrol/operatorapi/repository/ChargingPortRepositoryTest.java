package chargercontrol.operatorapi.repository;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import chargercontrol.operatorapi.model.ChargingType;
import chargercontrol.operatorapi.model.Station;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class ChargingPortRepositoryTest {

    @Autowired
    private ChargingPortRepository chargingPortRepository;

    @Autowired
    private StationRepository stationRepository;

    private Station savedStation;

    @BeforeEach
    void setup() {
        // Criar e salvar estação válida para associar ChargingPorts
        Station station = new Station();
        station.setName("Test Station");
        station.setLocation("Test Location");
        station.setPower(50.0);
        station.setLatitude(10.0);
        station.setLongitude(20.0);
        station.setAvailable(true);
        station.setChargingType(ChargingType.AC);
        savedStation = stationRepository.save(station);
    }

    @Test
    @DisplayName("Should find ChargingPorts by Station ID")
    void testFindByStationId() {
        ChargingPort port1 = new ChargingPort();
        port1.setStation(savedStation);
        port1.setStatus(ChargingPortStatus.AVAILABLE);
        port1.setPortIdentifier("PORT_1");
        chargingPortRepository.save(port1);

        ChargingPort port2 = new ChargingPort();
        port2.setStation(savedStation);
        port2.setStatus(ChargingPortStatus.IN_USE);
        port2.setPortIdentifier("PORT_2");
        chargingPortRepository.save(port2);

        List<ChargingPort> found = chargingPortRepository.findByStationId(savedStation.getId());
        assertThat(found).hasSize(2);
    }

    @Test
    @DisplayName("Should find ChargingPorts by Status")
    void testFindByStatus() {
        ChargingPort port1 = new ChargingPort();
        port1.setStation(savedStation);
        port1.setStatus(ChargingPortStatus.AVAILABLE);
        port1.setPortIdentifier("PORT_AVAILABLE");
        chargingPortRepository.save(port1);

        ChargingPort port2 = new ChargingPort();
        port2.setStation(savedStation);
        port2.setStatus(ChargingPortStatus.IN_USE);
        port2.setPortIdentifier("PORT_IN_USE");
        chargingPortRepository.save(port2);

        List<ChargingPort> availablePorts = chargingPortRepository.findByStatus(ChargingPortStatus.AVAILABLE);
        assertThat(availablePorts).hasSize(1);
        assertThat(availablePorts.get(0).getPortIdentifier()).isEqualTo("PORT_AVAILABLE");
    }

    @Test
    @DisplayName("Should find ChargingPorts by Port Identifier")
    void testFindByPortIdentifier() {
        ChargingPort port = new ChargingPort();
        port.setStation(savedStation);
        port.setStatus(ChargingPortStatus.AVAILABLE);
        port.setPortIdentifier("UNIQUE_PORT_ID");
        chargingPortRepository.save(port);

        List<ChargingPort> found = chargingPortRepository.findByPortIdentifier("UNIQUE_PORT_ID");
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getPortIdentifier()).isEqualTo("UNIQUE_PORT_ID");
    }

    @Test
    @DisplayName("Should find ChargingPorts by Station ID and Port Identifier")
    void testFindByStationIdAndPortIdentifier() {
        ChargingPort port = new ChargingPort();
        port.setStation(savedStation);
        port.setStatus(ChargingPortStatus.AVAILABLE);
        port.setPortIdentifier("PORT_42");
        chargingPortRepository.save(port);

        List<ChargingPort> found = chargingPortRepository.findByStationIdAndPortIdentifier(savedStation.getId(), "PORT_42");
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getPortIdentifier()).isEqualTo("PORT_42");
    }
}
