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
    
    public Station getStationById(Long id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + id));
    }
    
    @Transactional
    public Station updateStation(Long id, Station stationData) {
        Station existingStation = getStationById(id);
        
        // Atualiza os campos editáveis
        existingStation.setName(stationData.getName());
        existingStation.setLocation(stationData.getLocation());
        existingStation.setPower(stationData.getPower());
        existingStation.setLatitude(stationData.getLatitude());
        existingStation.setLongitude(stationData.getLongitude());
        existingStation.setChargingType(stationData.getChargingType());
        
        // Atualiza a disponibilidade se fornecida
        if (stationData.getAvailable() != null) {
            existingStation.setAvailable(stationData.getAvailable());
        }
        
        // Se as portas de carregamento forem fornecidas, atualiza-as
        if (stationData.getChargingPorts() != null) {
            // Remove as portas existentes
            existingStation.getChargingPorts().clear();
            
            // Adiciona as novas portas
            for (var port : stationData.getChargingPorts()) {
                existingStation.addChargingPort(port);
            }
        }
        
        return stationRepository.save(existingStation);
    }
    
    @Transactional
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new EntityNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }
}