import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, InputAdornment, Paper, Link, Container,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, CardActions, List, ListItem, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, ElectricCar, Power, LocationOn, Info, Search } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BookingModal from './BookingModal';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Create custom icons OUTSIDE the component to prevent recreation on re-renders
const chargingStationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#4CAF50" stroke="white" stroke-width="2"/>
      <path d="M12 8h8v16h-8V8z" fill="white"/>
      <path d="M10 12h12v2H10v-2z" fill="#4CAF50"/>
      <path d="M10 16h12v2H10v-2z" fill="#4CAF50"/>
      <path d="M10 20h12v2H10v-2z" fill="#4CAF50"/>
      <circle cx="22" cy="10" r="2" fill="#FFC107"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const unavailableIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#F44336" stroke="white" stroke-width="2"/>
      <path d="M12 8h8v16h-8V8z" fill="white"/>
      <path d="M10 12h12v2H10v-2z" fill="#F44336"/>
      <path d="M10 16h12v2H10v-2z" fill="#F44336"/>
      <path d="M10 20h12v2H10v-2z" fill="#F44336"/>
      <circle cx="22" cy="10" r="2" fill="#757575"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#2196F3" stroke="white" stroke-width="4"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
      <circle cx="16" cy="16" r="3" fill="#2196F3"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function Map() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.5, -8.0]); // Default to Portugal center
  const [mapInitialized, setMapInitialized] = useState(false);
  const [cars, setCars] = useState([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredStation, setHoveredStation] = useState(null);

  // Component to handle map centering on user location (only once)
  const LocationMarker = ({ userLocation }) => {
    const map = useMap();

    useEffect(() => {
      if (userLocation && !mapInitialized) {
        map.setView([userLocation.lat, userLocation.lng], 10);
        setMapInitialized(true);
      }
    }, [map, userLocation]);

    return userLocation ? (
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
        <Popup>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              📍 A tua localização
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </Typography>
          </Box>
        </Popup>
      </Marker>
    ) : null;
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);
          setMapCenter([latitude, longitude]);
          setLocationError(null);
        },
        (error) => {
          console.warn('Error getting user location:', error);
          setLocationError('Não foi possível obter a localização atual');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Geolocalização não é suportada neste browser');
    }
  }, []);

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/apiV1/stations');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Erro ao carregar estações de carregamento. Verifique se a API está em execução.');
        // Fallback data for demonstration
        setStations([
          {
            "id": 5,
            "name": "Estação Tesla Supercharger Lisboa",
            "location": "Centro Comercial Colombo, Lisboa",
            "power": 150,
            "latitude": 38.7578,
            "longitude": -9.1904,
            "available": true,
            "chargingType": "DC_ULTRA_FAST",
            "totalPorts": 8,
            "availablePorts": 3
          },
          {
            "id": 9,
            "name": "Estação Viana",
            "location": "Viana do Castelo",
            "power": 23,
            "latitude": 41.6938,
            "longitude": -8.8326,
            "available": true,
            "chargingType": "DC_FAST",
            "totalPorts": 4,
            "availablePorts": 2
          },
          {
            "id": 10,
            "name": "Estação Aveiro",
            "location": "Aveiro Centro",
            "power": 500,
            "latitude": 40.6405,
            "longitude": -8.6538,
            "available": false,
            "chargingType": "DC_FAST",
            "totalPorts": 6,
            "availablePorts": 0
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Fetch cars from API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const jwtToken = localStorage.getItem('jwt');
        const response = await fetch(`http://localhost:8080/apiV1/cars/user/${jwtToken}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCars(data);
      } catch (err) {
        console.error('Error fetching cars:', err);
      }
    };

    fetchCars();
  }, []);

  const handleStationClick = (station) => {
    setSelectedStation(station);
    setDialogOpen(true);
  };

  const getChargingTypeColor = (type) => {
    switch (type) {
      case 'DC_ULTRA_FAST':
        return '#4CAF50';
      case 'DC_FAST':
        return '#FF9800';
      case 'AC':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  // Calculate distance between two points (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter and sort stations
  const filteredAndSortedStations = React.useMemo(() => {
    let filtered = stations.filter(station =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (userLocation) {
      filtered = filtered.map(station => ({
        ...station,
        distance: calculateDistance(userLocation.lat, userLocation.lng, station.latitude, station.longitude)
      })).sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  }, [stations, searchTerm, userLocation]);

  const getChargingTypeLabel = (type) => {
    switch (type) {
      case 'DC_ULTRA_FAST':
        return 'Ultra Rápido';
      case 'DC_FAST':
        return 'Rápido';
      case 'AC':
        return 'Normal';
      default:
        return type;
    }
  };

  const handleStationCardClick = (station) => {
    setSelectedStation(station);
    // Center map on selected station
    setMapCenter([station.latitude, station.longitude]);
  };

  const handleStationCardHover = (station) => {
    setHoveredStation(station);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Carregando mapa...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex' }}>
      {/* Left Side - Map */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {error && (
          <Alert 
            severity="warning" 
            sx={{ 
              position: 'absolute', 
              top: 10, 
              left: 10, 
              right: 10, 
              zIndex: 1000 
            }}
          >
            {error}
          </Alert>
        )}
        
        {locationError && (
          <Alert 
            severity="info" 
            sx={{ 
              position: 'absolute', 
              top: error ? 70 : 10, 
              left: 10, 
              right: 10, 
              zIndex: 1000 
            }}
          >
            {locationError} - A usar localização padrão
          </Alert>
        )}
        
        <MapContainer
          center={mapCenter}
          zoom={userLocation ? 10 : 7}
          style={{ height: '100%', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* User location marker */}
          <LocationMarker userLocation={userLocation} />
          
          {filteredAndSortedStations.map((station) => {
            const isHovered = hoveredStation?.id === station.id;
            return (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                icon={station.available ? chargingStationIcon : unavailableIcon}
                eventHandlers={{
                  click: () => handleStationClick(station),
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  }
                }}
              >
                <Popup closeButton={false} autoClose={false} closeOnClick={false}>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {station.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" />
                      {station.location}
                    </Typography>
                    {station.distance && (
                      <Typography variant="body2" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                        📍 {station.distance.toFixed(1)} km de distância
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${station.power}kW`}
                        size="small"
                        icon={<Power />}
                        color="primary"
                      />
                      <Chip
                        label={getChargingTypeLabel(station.chargingType)}
                        size="small"
                        sx={{ 
                          backgroundColor: getChargingTypeColor(station.chargingType),
                          color: 'white'
                        }}
                      />
                      <Chip
                        label={station.available ? 'Disponível' : 'Indisponível'}
                        size="small"
                        color={station.available ? 'success' : 'error'}
                      />
                    </Box>
                    {station.totalPorts && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Portas: {station.availablePorts}/{station.totalPorts} disponíveis
                      </Typography>
                    )}
                  </Box>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Box>

      {/* Right Side - Stations List */}
      <Box sx={{ 
        width: '400px', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.default'
      }}>
        {/* Header with Search */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Estações de Carregamento
          </Typography>
          <TextField
            fullWidth
            placeholder="Pesquisar estações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filteredAndSortedStations.length} estações encontradas
          </Typography>
        </Box>

        {/* Stations List */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          },
        }}>
          {filteredAndSortedStations.map((station, index) => (
            <Card 
              key={station.id}
              sx={{ 
                m: 2, 
                cursor: 'pointer',
                border: hoveredStation?.id === station.id ? 2 : 1,
                borderColor: hoveredStation?.id === station.id ? 'primary.main' : 'divider',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => handleStationCardClick(station)}
              onMouseEnter={() => handleStationCardHover(station)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                    {station.name}
                  </Typography>
                  <Chip
                    label={station.available ? 'Disponível' : 'Indisponível'}
                    size="small"
                    color={station.available ? 'success' : 'error'}
                    variant="filled"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn fontSize="small" />
                  {station.location}
                </Typography>

                {station.distance && (
                  <Typography variant="body2" color="primary.main" sx={{ mb: 1, fontWeight: 'bold' }}>
                    📍 {station.distance.toFixed(1)} km de distância
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${station.power}kW`}
                    size="small"
                    icon={<Power />}
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    label={getChargingTypeLabel(station.chargingType)}
                    size="small"
                    sx={{ 
                      backgroundColor: getChargingTypeColor(station.chargingType),
                      color: 'white'
                    }}
                  />
                </Box>

                {station.totalPorts && (
                  <Typography variant="body2" color="text.secondary">
                    Portas: {station.availablePorts}/{station.totalPorts} disponíveis
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                <Button 
                  size="small" 
                  startIcon={<ElectricCar />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStation(station);
                    setBookingModalOpen(true);
                  }}
                >
                  Reservar
                </Button>
                <Button 
                  size="small" 
                  startIcon={<LocationOn />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
                    window.open(url, '_blank');
                  }}
                >
                  Navegar
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Station Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedStation && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ElectricCar color="primary" />
                {selectedStation.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Localização
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" />
                    {selectedStation.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Coordenadas: {selectedStation.latitude}, {selectedStation.longitude}
                  </Typography>
                  {userLocation && selectedStation.distance && (
                    <Typography variant="body2" color="primary.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                      📍 {selectedStation.distance.toFixed(1)} km de distância
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {selectedStation.power}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      kW de Potência
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: selectedStation.available ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {selectedStation.available ? 'Disponível' : 'Indisponível'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estado
                    </Typography>
                  </Paper>
                </Box>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tipo de Carregamento
                  </Typography>
                  <Chip
                    label={getChargingTypeLabel(selectedStation.chargingType)}
                    sx={{ 
                      backgroundColor: getChargingTypeColor(selectedStation.chargingType),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Paper>

                {selectedStation.totalPorts && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Disponibilidade de Portas
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        {selectedStation.availablePorts}
                      </Typography>
                      <Typography variant="body1">
                        de {selectedStation.totalPorts} portas disponíveis
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
              <Button 
                variant="outlined" 
                startIcon={<ElectricCar />}
                onClick={() => {
                  setBookingModalOpen(true);
                }}
              >
                Reservar
              </Button>
              <Button 
                variant="contained" 
                startIcon={<LocationOn />}
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`;
                  window.open(url, '_blank');
                }}
              >
                Navegar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Booking Modal */}
      <BookingModal 
        open={bookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
        station={selectedStation} 
        cars={cars} 
      />
    </Box>
  );
}

export default Map;