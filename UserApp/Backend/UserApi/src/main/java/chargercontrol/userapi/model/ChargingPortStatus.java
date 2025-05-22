package chargercontrol.userapi.model;

public enum ChargingPortStatus {
    AVAILABLE,
    CHARGING,
    OCCUPIED_NOT_CHARGING, // e.g., car plugged in but not drawing power or waiting
    OUT_OF_SERVICE,
    MAINTENANCE,
    UNKNOWN
}
