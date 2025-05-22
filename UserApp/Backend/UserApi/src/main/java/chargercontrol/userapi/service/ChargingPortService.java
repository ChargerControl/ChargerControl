package chargercontrol.userapi.service;

import chargercontrol.userapi.model.ChargingPort;
import chargercontrol.userapi.model.ChargingPortStatus;
import chargercontrol.userapi.model.Station;
import chargercontrol.userapi.repository.ChargingPortRepository;
import chargercontrol.userapi.repository.StationRepository;
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
        // Ensure new ports are initialized with a default status if not provided, e.g.,
        // AVAILABLE
        if (chargingPort.getStatus() == null) {
            chargingPort.setStatus(ChargingPortStatus.AVAILABLE);
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

    @Transactional
    public ChargingPort updateChargingPortStatus(Long portId, ChargingPortStatus status) {
        ChargingPort port = getChargingPortById(portId);
        port.setStatus(status);
        return chargingPortRepository.save(port);
    }

    @Transactional
    public ChargingPort updateChargingPort(Long portId, ChargingPort portDetails) {
        ChargingPort existingPort = getChargingPortById(portId);
        existingPort.setPortIdentifier(portDetails.getPortIdentifier());
        existingPort.setStatus(portDetails.getStatus());
        
        // Potentially update other fields like energyUsed if applicable through this
        // method
        // existingPort.setEnergyUsed(portDetails.getEnergyUsed());
        // Note: Station should not be changed here. If a port needs to move to another
        // station, it's likely a delete and recreate.
        return chargingPortRepository.save(existingPort);
    }

    @Transactional
    public void deleteChargingPort(Long portId) {
        if (!chargingPortRepository.existsById(portId)) {
            throw new EntityNotFoundException("ChargingPort not found with id: " + portId);
        }
        chargingPortRepository.deleteById(portId);
    }
}
