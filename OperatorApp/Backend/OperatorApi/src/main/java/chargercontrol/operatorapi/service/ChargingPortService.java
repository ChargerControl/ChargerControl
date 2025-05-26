package chargercontrol.operatorapi.service;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import chargercontrol.operatorapi.repository.ChargingPortRepository;
import chargercontrol.operatorapi.repository.StationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChargingPortService {
    
    private final ChargingPortRepository chargingPortRepository;
    private final StationRepository stationRepository;
    
    public ChargingPortService(ChargingPortRepository chargingPortRepository, StationRepository stationRepository) {
        this.chargingPortRepository = chargingPortRepository;
        this.stationRepository = stationRepository;
    }
    
    public List<ChargingPort> getChargingPortsByStationId(Long stationId) {
        if (!stationRepository.existsById(stationId)) {
            throw new EntityNotFoundException("Station not found with id: " + stationId);
        }
        return chargingPortRepository.findByStationId(stationId);
    }
    
    public List<ChargingPort> getChargingPortsByStatus(ChargingPortStatus status) {
        return chargingPortRepository.findByStatus(status);
    }
    
    @Transactional
    public void deleteChargingPort(Long portId) {
        if (!chargingPortRepository.existsById(portId)) {
            throw new EntityNotFoundException("ChargingPort not found with id: " + portId);
        }
        chargingPortRepository.deleteById(portId);
    }
    
    public Double getTotalEnergyUsedByStation(Long stationId) {
        List<ChargingPort> ports = chargingPortRepository.findByStationId(stationId);
        return ports.stream()
                .mapToDouble(ChargingPort::getEnergyUsed)
                .sum();
    }
}