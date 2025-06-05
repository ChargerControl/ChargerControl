package chargercontrol.operatorapi.repository;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargingPortRepository extends JpaRepository<ChargingPort, Long> {
    
    // Usar station.id em vez de stationId devido ao relacionamento @ManyToOne
    @Query("SELECT cp FROM ChargingPort cp WHERE cp.station.id = :stationId")
    List<ChargingPort> findByStationId(@Param("stationId") Long stationId);
    
    @Query("SELECT cp FROM ChargingPort cp WHERE cp.station.id = :stationId AND cp.status = :status")
    List<ChargingPort> findByStationIdAndStatus(@Param("stationId") Long stationId, @Param("status") ChargingPortStatus status);
    
    List<ChargingPort> findByStatus(ChargingPortStatus status);
    
    // Método adicional para buscar por port identifier
    @Query("SELECT cp FROM ChargingPort cp WHERE cp.portIdentifier = :portIdentifier")
    List<ChargingPort> findByPortIdentifier(@Param("portIdentifier") String portIdentifier);
    
    // Método para verificar se existe um port com determinado identifier em uma estação
    @Query("SELECT cp FROM ChargingPort cp WHERE cp.station.id = :stationId AND cp.portIdentifier = :portIdentifier")
    List<ChargingPort> findByStationIdAndPortIdentifier(@Param("stationId") Long stationId, @Param("portIdentifier") String portIdentifier);
}