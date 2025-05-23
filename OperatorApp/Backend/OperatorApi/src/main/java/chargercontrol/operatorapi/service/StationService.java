package chargercontrol.operatorapi.service;

import chargercontrol.operatorapi.model.ChargingType;
import chargercontrol.operatorapi.model.Station;
import chargercontrol.operatorapi.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
    
    public Optional<Station> getStationById(Long id) {
        return stationRepository.findById(id);
    }
    
    public Optional<Station> getStationByName(String name) {
        return stationRepository.findByName(name);
    }
    
    public List<Station> getStationsByAvailability(Boolean available) {
        return stationRepository.findByAvailable(available);
    }
    
    public List<Station> getStationsByChargingType(ChargingType chargingType) {
        return stationRepository.findByChargingType(chargingType);
    }
    
    public List<Station> getStationsByAvailabilityAndChargingType(Boolean available, ChargingType chargingType) {
        return stationRepository.findByAvailableAndChargingType(available, chargingType);
    }
    
    public List<Station> getStationsByLocation(String location) {
        return stationRepository.findByLocationContaining(location);
    }
    
    public List<Station> getStationsNearCoordinates(Double latitude, Double longitude, Double radiusKm) {
        // Conversão aproximada: 1 grau ≈ 111 km
        Double latRange = radiusKm / 111.0;
        Double lonRange = radiusKm / (111.0 * Math.cos(Math.toRadians(latitude)));
        return stationRepository.findStationsNearCoordinates(latitude, longitude, latRange, lonRange);
    }
    
    @Transactional
    public Station updateStation(Long id, Station stationDetails) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + id));
        
        station.setName(stationDetails.getName());
        station.setLocation(stationDetails.getLocation());
        station.setPower(stationDetails.getPower());
        station.setLatitude(stationDetails.getLatitude());
        station.setLongitude(stationDetails.getLongitude());
        station.setAvailable(stationDetails.getAvailable());
        station.setChargingType(stationDetails.getChargingType());
        
        // Nota: ChargingPorts devem ser gerenciados através do ChargingPortService
        // para manter a integridade referencial
        
        return stationRepository.save(station);
    }
    
    @Transactional
    public Station updateStationAvailability(Long id, Boolean available) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + id));
        
        station.setAvailable(available);
        return stationRepository.save(station);
    }
    
    @Transactional
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new EntityNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }
}