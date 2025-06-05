package chargercontrol.operatorapi.dto;

import chargercontrol.operatorapi.model.ChargingPortStatus;

public class ChargingPortRequest {
    
    private String portIdentifier;
    private ChargingPortStatus status;
    private Double energyUsed;
    
    // Getters e Setters
    
    public String getPortIdentifier() {
        return portIdentifier;
    }
    
    public void setPortIdentifier(String portIdentifier) {
        this.portIdentifier = portIdentifier;
    }
    
    public ChargingPortStatus getStatus() {
        return status;
    }
    
    public void setStatus(ChargingPortStatus status) {
        this.status = status;
    }
    
    public Double getEnergyUsed() {
        return energyUsed;
    }
    
    public void setEnergyUsed(Double energyUsed) {
        this.energyUsed = energyUsed;
    }
}
