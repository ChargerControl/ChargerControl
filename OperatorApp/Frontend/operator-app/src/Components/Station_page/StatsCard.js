// StatsCards.jsx
import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle, 
  Assessment, 
  Nature, 
  Warning, 
  EvStation,
  BatteryChargingFull,
  Refresh
} from '@mui/icons-material';

const StatsCards = () => {
  const [stats, setStats] = useState({
    onlineStations: 0,
    totalStations: 0,
    totalAvailablePorts: 0,
    totalChargingPorts: 0,
    totalEnergy: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all stations and their statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get all stations
      const stationsResponse = await fetch('http://192.168.160.7:8081/apiV1/stations');
      const stations = await stationsResponse.json();
      
      // Get available stations (assuming available stations are "online")
      const availableStationsResponse = await fetch('http://192.168.160.7:8081/apiV1/stations/available/true');
      const onlineStations = await availableStationsResponse.json();
      
      // Get all charging ports by status
      const [availablePortsResponse, chargingPortsResponse] = await Promise.all([
        fetch('http://192.168.160.7:8081/apiV1/chargingports/status/AVAILABLE'),
        fetch('http://192.168.160.7:8081/apiV1/chargingports/status/CHARGING')
      ]);
      
      const availablePorts = await availablePortsResponse.json();
      const chargingPorts = await chargingPortsResponse.json();
      
      // Calculate total energy from all stations
      let totalEnergy = 0;
      const energyPromises = stations.map(async (station) => {
        try {
          const energyResponse = await fetch(`http://192.168.160.7:8081/apiV1/chargingports/station/${station.id}/stats/energy`);
          const energy = await energyResponse.json();
          // Ensure energy is a number
          const numericEnergy = parseFloat(energy) || 0;
          return isNaN(numericEnergy) ? 0 : numericEnergy;
        } catch (error) {
          return 0;
        }
      });
      
      const energyResults = await Promise.all(energyPromises);
      totalEnergy = energyResults.reduce((sum, energy) => {
        const numericEnergy = parseFloat(energy) || 0;
        return sum + (isNaN(numericEnergy) ? 0 : numericEnergy);
      }, 0);
      
      // Get out of order ports for alerts
      const outOfOrderResponse = await fetch('http://192.168.160.7:8081/apiV1/chargingports/status/OUT_OF_ORDER');
      const outOfOrderPorts = await outOfOrderResponse.json();
      
      setStats({
        onlineStations: Array.isArray(onlineStations) ? onlineStations.length : 0,
        totalStations: Array.isArray(stations) ? stations.length : 0,
        totalAvailablePorts: Array.isArray(availablePorts) ? availablePorts.length : 0,
        totalChargingPorts: Array.isArray(chargingPorts) ? chargingPorts.length : 0,
        totalEnergy: parseFloat(totalEnergy) || 0,
        activeAlerts: Array.isArray(outOfOrderPorts) ? outOfOrderPorts.length : 0
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values on error
      setStats({
        onlineStations: 0,
        totalStations: 0,
        totalAvailablePorts: 0,
        totalChargingPorts: 0,
        totalEnergy: 0,
        activeAlerts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const cardConfigs = [
    {
      title: 'Estações Online',
      value: `${stats.onlineStations}/${stats.totalStations}`,
      subtitle: `${Math.round((stats.onlineStations / Math.max(stats.totalStations, 1)) * 100)}% operacional`,
      icon: CheckCircle,
      color: 'success.main',
      bgColor: 'success.lighter',
      darkBgColor: '#1b5e20'
    },
    {
      title: 'Ports Disponíveis',
      value: stats.totalAvailablePorts,
      subtitle: `${stats.totalChargingPorts} em carregamento`,
      icon: EvStation,
      color: 'primary.main',
      bgColor: 'primary.lighter',
      darkBgColor: '#0d47a1'
    }
  ];

  const StatCard = ({ config, isLoading }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: (theme) => theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${config.darkBgColor}20, ${config.darkBgColor}10)`
          : `linear-gradient(135deg, ${config.bgColor || '#f5f5f5'}, rgba(255,255,255,0.8))`,
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? config.darkBgColor + '40' : config.bgColor}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 8px 25px rgba(0,0,0,0.3)' 
            : '0 8px 25px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.9rem',
                fontWeight: 500,
                mb: 1
              }}
            >
              {config.title}
            </Typography>
            
            {isLoading ? (
              <Skeleton variant="text" width="60%" height={40} />
            ) : (
              <Typography 
                variant="h3" 
                sx={{ 
                  color: config.color,
                  fontWeight: 700,
                  fontSize: '2rem',
                  mb: 0.5
                }}
              >
                {config.value}
              </Typography>
            )}
            
            {isLoading ? (
              <Skeleton variant="text" width="80%" height={20} />
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.8rem'
                }}
              >
                {config.subtitle}
              </Typography>
            )}
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: config.color,
              color: 'white',
              ml: 2
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <config.icon sx={{ fontSize: 28 }} />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Estatísticas em Tempo Real
        </Typography>
        <Tooltip title="Atualizar dados">
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            {refreshing ? <CircularProgress size={20} /> : <Refresh />}
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {cardConfigs.map((config, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard config={config} isLoading={loading} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsCards;