package chargercontrol.operatorapi.service;

import chargercontrol.operatorapi.model.ChargingPort;
import chargercontrol.operatorapi.model.ChargingPortStatus;
import chargercontrol.operatorapi.model.Station;
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
    
    @Transactional
    public ChargingPort createChargingPort(Long stationId, ChargingPort chargingPort) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + stationId));
        
        chargingPort.setStation(station);
        
        // Ensure new ports are initialized with a default status if not provided
        if (chargingPort.getStatus() == null) {
            chargingPort.setStatus(ChargingPortStatus.AVAILABLE);
        }
        
        // Initialize energyUsed if not provided
        if (chargingPort.getEnergyUsed() == null) {
            chargingPort.setEnergyUsed(0.0);
        }
        
        return chargingPortRepository.save(chargingPort);
    }
    
    public ChargingPort getChargingPortById(Long portId) {
        return chargingPortRepository.findById(portId)
                .orElseThrow(() -> new EntityNotFoundException("ChargingPort not found with id: " + portId));
    }
    
    public List<ChargingPort> getChargingPortsByStationId(Long stationId) {
        if (!stationRepository.existsById(stationId)) {
            throw new EntityNotFoundException("Station not found with id: " + stationId);
        }
        return chargingPortRepository.findByStationId(stationId);
    }
    
    public List<ChargingPort> getChargingPortsByStationIdAndStatus(Long stationId, ChargingPortStatus status) {
        if (!stationRepository.existsById(stationId)) {
            throw new EntityNotFoundException("Station not found with id: " + stationId);
        }
        return chargingPortRepository.findByStationIdAndStatus(stationId, status);
    }
    
    public List<ChargingPort> getChargingPortsByStatus(ChargingPortStatus status) {
        return chargingPortRepository.findByStatus(status);
    }
    
    @Transactional
    public ChargingPort updateChargingPortStatus(Long portId, ChargingPortStatus status) {
        ChargingPort port = getChargingPortById(portId);
        port.setStatus(status);
        return chargingPortRepository.save(port);
    }
    
    @Transactional
    public ChargingPort updateChargingPortEnergyUsed(Long portId, Double energyUsed) {
        ChargingPort port = getChargingPortById(portId);
        if (energyUsed < 0) {
            throw new IllegalArgumentException("Energy used cannot be negative");
        }
        port.setEnergyUsed(energyUsed);
        return chargingPortRepository.save(port);
    }
    
    @Transactional
    public ChargingPort incrementEnergyUsed(Long portId, Double additionalEnergy) {
        ChargingPort port = getChargingPortById(portId);
        if (additionalEnergy < 0) {
            throw new IllegalArgumentException("Additional energy cannot be negative");
        }
        port.setEnergyUsed(port.getEnergyUsed() + additionalEnergy);
        return chargingPortRepository.save(port);
    }
    
    @Transactional
    public ChargingPort resetEnergyUsed(Long portId) {
        ChargingPort port = getChargingPortById(portId);
        port.setEnergyUsed(0.0);
        return chargingPortRepository.save(port);
    }
    
    @Transactional
    public ChargingPort updateChargingPort(Long portId, ChargingPort portDetails) {
        ChargingPort existingPort = getChargingPortById(portId);
        
        if (portDetails.getPortIdentifier() != null) {
            existingPort.setPortIdentifier(portDetails.getPortIdentifier());
        }
        
        if (portDetails.getStatus() != null) {
            existingPort.setStatus(portDetails.getStatus());
        }
        
        if (portDetails.getEnergyUsed() != null && portDetails.getEnergyUsed() >= 0) {
            existingPort.setEnergyUsed(portDetails.getEnergyUsed());
        }
        
        // Note: Station should not be changed here. If a port needs to move to another
        // station, it should be deleted and recreated.
        
        return chargingPortRepository.save(existingPort);
    }
    
    @Transactional
    public void deleteChargingPort(Long portId) {
        if (!chargingPortRepository.existsById(portId)) {
            throw new EntityNotFoundException("ChargingPort not found with id: " + portId);
        }
        chargingPortRepository.deleteById(portId);
    }
    
    // Método utilitário para obter estatísticas de uma estação
    public long countAvailablePortsByStation(Long stationId) {
        return chargingPortRepository.findByStationIdAndStatus(stationId, ChargingPortStatus.AVAILABLE).size();
    }
    
    public long countChargingPortsByStation(Long stationId) {
        return chargingPortRepository.findByStationIdAndStatus(stationId, ChargingPortStatus.CHARGING).size();
    }
    
    public Double getTotalEnergyUsedByStation(Long stationId) {
        List<ChargingPort> ports = chargingPortRepository.findByStationId(stationId);
        return ports.stream()
                .mapToDouble(ChargingPort::getEnergyUsed)
                .sum();
    }
}