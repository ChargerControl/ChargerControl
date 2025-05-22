package chargercontrol.userapi.service;

import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.repository.StationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StationService {

    private final StationRepository stationRepository;

    public StationService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    public Station saveStation(Station station) {
        // Add any business logic before saving, e.g., validation
        return stationRepository.save(station);
    }

    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    public Optional<Station> getStationById(Long id) {
        return stationRepository.findById(id);
    }

    public Optional<Station> getStationByName(String name) {
        return stationRepository.findByName(name);
    }

    public Station updateStation(Long id, Station stationDetails) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));

        station.setName(stationDetails.getName());
        station.setChargingPorts(stationDetails.getChargingPorts());
        return stationRepository.save(station);
    }

    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new RuntimeException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }
}
