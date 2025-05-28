package chargercontrol.userapi.model;

public class ChargingPortCreateRequest {
    private String portIdentifier;
    private ChargingPortStatus status;
    private Double energyUsed;

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

