package chargercontrol.userapi.service;

import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.repository.StationRepository;
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
    
    @Transactional(readOnly = true) // IMPORTANTE: Mantém a sessão aberta para lazy loading
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Station> getStationById(Long id) {
        return stationRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Station> getStationByName(String name) {
        return stationRepository.findByName(name);
    }
    
    @Transactional
    public Station updateStation(Long id, Station stationDetails) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + id));
        
        // Atualiza todos os campos necessários
        station.setName(stationDetails.getName());
        if (stationDetails.getLocation() != null) {
            station.setLocation(stationDetails.getLocation());
        }
        if (stationDetails.getPower() != null) {
            station.setPower(stationDetails.getPower());
        }
        if (stationDetails.getLatitude() != null) {
            station.setLatitude(stationDetails.getLatitude());
        }
        if (stationDetails.getLongitude() != null) {
            station.setLongitude(stationDetails.getLongitude());
        }
        if (stationDetails.getAvailable() != null) {
            station.setAvailable(stationDetails.getAvailable());
        }
        if (stationDetails.getChargingType() != null) {
            station.setChargingType(stationDetails.getChargingType());
        }
        
        // Se as portas de carregamento forem fornecidas, atualiza-as
        if (stationDetails.getChargingPorts() != null) {
            station.getChargingPorts().clear();
            for (var port : stationDetails.getChargingPorts()) {
                station.addChargingPort(port);
            }
        }
        
        return stationRepository.save(station);
    }
    
    @Transactional
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new EntityNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }
    
    // Método adicional para buscar por disponibilidade (como na operatorApp)
    @Transactional(readOnly = true)
    public List<Station> getStationsByAvailability(Boolean available) {
        return stationRepository.findByAvailable(available);
    }
}