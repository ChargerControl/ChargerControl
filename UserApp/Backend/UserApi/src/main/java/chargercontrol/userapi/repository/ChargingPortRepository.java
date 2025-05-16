package chargercontrol.userapi.repository;

import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargingPortRepository extends JpaRepository<ChargingPort, Long> {
    List<ChargingPort> findByStationId(Long stationId);

    List<ChargingPort> findByStationIdAndStatus(Long stationId, ChargingPortStatus status);

    List<ChargingPort> findByStatus(ChargingPortStatus status);
}
