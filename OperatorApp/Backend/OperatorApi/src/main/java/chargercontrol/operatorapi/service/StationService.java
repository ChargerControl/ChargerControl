package chargercontrol.operatorapi.service;

import chargercontrol.operatorapi.model.Station;
import chargercontrol.operatorapi.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StationService {
    
    private final StationRepository stationRepository;
    
    public StationService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }
    
    @Transactional
    public Station saveStation(Station station) {
        // Associa cada ChargingPort à Station antes de salvar
        if (station.getChargingPorts() != null) {
            for (var port : station.getChargingPorts()) {
                port.setStation(station);
            }
        }
        return stationRepository.save(station);
    }
    
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }
    
    public List<Station> getStationsByAvailability(Boolean available) {
        return stationRepository.findByAvailable(available);
    }
    
    @Transactional
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new EntityNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }

    public Station getStationById(Long id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + id));
    }
    
}