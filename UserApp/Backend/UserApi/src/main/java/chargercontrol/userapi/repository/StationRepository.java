package chargercontrol.userapi.repository;

import chargercontrol.userapi.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    Optional<Station> findByName(String name);
    List<Station> findByAvailable(Boolean available);
}