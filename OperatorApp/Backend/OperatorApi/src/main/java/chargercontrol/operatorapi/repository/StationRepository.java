package chargercontrol.operatorapi.repository;

import chargercontrol.operatorapi.model.ChargingType;
import chargercontrol.operatorapi.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    
    Optional<Station> findByName(String name);
    
    List<Station> findByAvailable(Boolean available);
    
    List<Station> findByChargingType(ChargingType chargingType);
    
    List<Station> findByAvailableAndChargingType(Boolean available, ChargingType chargingType);
    
    @Query("SELECT s FROM Station s WHERE s.location LIKE %:location%")
    List<Station> findByLocationContaining(@Param("location") String location);
    
    // Buscar estações dentro de um raio (aproximado usando coordenadas)
    @Query("SELECT s FROM Station s WHERE " +
           "ABS(s.latitude - :latitude) <= :latRange AND " +
           "ABS(s.longitude - :longitude) <= :lonRange")
    List<Station> findStationsNearCoordinates(
            @Param("latitude") Double latitude, 
            @Param("longitude") Double longitude,
            @Param("latRange") Double latRange,
            @Param("lonRange") Double lonRange);
}