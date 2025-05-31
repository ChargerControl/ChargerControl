package chargercontrol.userapi.model;

public enum ChargingType {
    AC_SLOW,        // Carregamento AC lento (até 22kW)
    AC_FAST,        // Carregamento AC rápido (22kW - 43kW)
    DC_FAST,        // Carregamento DC rápido (50kW - 150kW)
    DC_ULTRA_FAST,  // Carregamento DC ultra rápido (150kW+)
    TESLA_SUPERCHARGER, // Tesla Supercharger
    CCS,            // Combined Charging System
    CHADEMO,        // CHAdeMO
    TYPE2           // Type 2 (Mennekes)
, FAST, AC, DC
}