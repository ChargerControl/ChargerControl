import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, InputAdornment, Paper, Link, Container,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, CardActions, List, ListItem, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, ElectricCar, Power, LocationOn, Info, Search, Navigation } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BookingModal from './BookingModal';

// Tema personalizado para consistência com a navbar
const theme = createTheme({
  palette: {
    primary: {
      main: '#76ff03',
      light: '#b2ff59',
      dark: '#64dd17',
    },
    secondary: {
      main: '#1a1a1a',
      light: '#333333',
      dark: '#000000',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Componentes estilizados
const StyledCard = styled(Card)(({ theme, isHovered }) => ({
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: isHovered ? '2px solid #76ff03' : '1px solid rgba(118, 255, 3, 0.2)',
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  margin: '12px',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(118, 255, 3, 0.1), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(118, 255, 3, 0.3)',
    '&::before': {
      left: '100%',
    },
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #76ff03 30%, #64dd17 90%)',
  borderRadius: '20px',
  padding: '8px 16px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  color: '#1a1a1a',
  transition: 'all 0.3s ease',
  minWidth: 'auto',
  '&:hover': {
    background: 'linear-gradient(45deg, #64dd17 30%, #76ff03 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(118, 255, 3, 0.4)',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  borderColor: '#76ff03',
  color: '#76ff03',
  borderRadius: '20px',
  padding: '8px 16px',
  fontSize: '0.875rem',
  fontWeight: 500,
  textTransform: 'none',
  minWidth: 'auto',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#64dd17',
    backgroundColor: 'rgba(118, 255, 3, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: '24px',
  borderRadius: '12px',
  ...(status === 'available' && {
    backgroundColor: '#76ff03',
    color: '#1a1a1a',
    boxShadow: '0 0 10px rgba(118, 255, 3, 0.5)',
  }),
  ...(status === 'unavailable' && {
    backgroundColor: '#ff5252',
    color: 'white',
    boxShadow: '0 0 10px rgba(255, 82, 82, 0.3)',
  }),
}));

const PowerChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(118, 255, 3, 0.2)',
  color: '#76ff03',
  fontWeight: 600,
  fontSize: '0.75rem',
  height: '24px',
  borderRadius: '12px',
  border: '1px solid rgba(118, 255, 3, 0.3)',
}));

const TypeChip = styled(Chip)(({ theme, chargingType }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'DC_ULTRA_FAST':
        return { bg: '#4CAF50', shadow: '0 0 10px rgba(76, 175, 80, 0.4)' };
      case 'DC_FAST':
        return { bg: '#FF9800', shadow: '0 0 10px rgba(255, 152, 0, 0.4)' };
      case 'AC':
        return { bg: '#2196F3', shadow: '0 0 10px rgba(33, 150, 243, 0.4)' };
      default:
        return { bg: '#757575', shadow: '0 0 10px rgba(117, 117, 117, 0.4)' };
    }
  };

  const colors = getTypeColor(chargingType);
  return {
    backgroundColor: colors.bg,
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '24px',
    borderRadius: '12px',
    boxShadow: colors.shadow,
  };
});

const SearchContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(118, 255, 3, 0.2)',
  padding: '20px',
}));

// Fix para marcadores padrão no react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Ícones personalizados criados FORA do componente para evitar recriação em re-renders
const chargingStationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#76ff03" stroke="white" stroke-width="2"/>
      <path d="M12 8h8v16h-8V8z" fill="white"/>
      <path d="M10 12h12v2H10v-2z" fill="#76ff03"/>
      <path d="M10 16h12v2H10v-2z" fill="#76ff03"/>
      <path d="M10 20h12v2H10v-2z" fill="#76ff03"/>
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
      <circle cx="16" cy="16" r="12" fill="#76ff03" stroke="white" stroke-width="4"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
      <circle cx="16" cy="16" r="3" fill="#76ff03"/>
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
  const [mapCenter, setMapCenter] = useState([39.5, -8.0]); // Padrão para centro de Portugal
  const [mapInitialized, setMapInitialized] = useState(false);
  const [cars, setCars] = useState([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredStation, setHoveredStation] = useState(null);

  // Componente para lidar com centralização do mapa na localização do usuário (apenas uma vez)
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

  // Obter localização atual do usuário
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
          console.warn('Erro ao obter localização do usuário:', error);
          setLocationError('Não foi possível obter a localização atual');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    } else {
      setLocationError('Geolocalização não é suportada neste browser');
    }
  }, []);

  // Buscar estações da API (removidos valores estáticos)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/apiV1/stations');
        
        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStations(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar estações:', err);
        setError('Erro ao carregar estações de carregamento. Verifique se a API está em execução.');
        setStations([]); // Array vazio em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Buscar carros da API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const jwtToken = localStorage.getItem('jwt');
        if (!jwtToken) return;
        
        const response = await fetch(`http://localhost:8080/apiV1/cars/user/${jwtToken}`);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCars(data);
      } catch (err) {
        console.error('Erro ao buscar carros:', err);
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

  // Calcular distância entre dois pontos (em km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filtrar e ordenar estações
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
    // Centralizar mapa na estação selecionada
    setMapCenter([station.latitude, station.longitude]);
  };

  const handleStationCardHover = (station) => {
    setHoveredStation(station);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#0f0f0f',
            color: 'white'
          }}
        >
          <CircularProgress size={60} sx={{ color: '#76ff03' }} />
          <Typography variant="h6">Carregando mapa...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', minHeight: 'calc(100vh - 129px)' }}>
        {/* Lado Esquerdo - Mapa */}
        <Box sx={{ flex: 1, position: 'relative', height: '100vh' }}>
          {error && (
            <Alert 
              severity="warning" 
              sx={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                right: 10, 
                zIndex: 1000,
                backgroundColor: 'rgba(255, 152, 0, 0.9)',
                color: 'white'
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
                zIndex: 1000,
                backgroundColor: 'rgba(33, 150, 243, 0.9)',
                color: 'white'
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
            
            {/* Marcador de localização do usuário */}
            <LocationMarker userLocation={userLocation} />
            
            {filteredAndSortedStations.map((station) => (
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
            ))}
          </MapContainer>
        </Box>

        {/* Lado Direito - Lista de Estações */}
        <Box sx={{ 
          width: '420px', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#0f0f0f',
          overflow: 'hidden'
        }}>
          {/* Cabeçalho com Pesquisa */}
          <SearchContainer>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
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
                    <Search sx={{ color: '#76ff03' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(26, 26, 26, 0.8)',
                  borderRadius: '25px',
                  '& fieldset': {
                    borderColor: 'rgba(118, 255, 3, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(118, 255, 3, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#76ff03',
                  },
                  color: 'white',
                }
              }}
              size="small"
            />
            <Typography variant="body2" sx={{ mt: 2, color: '#76ff03', fontWeight: 'bold' }}>
              {filteredAndSortedStations.length} estações encontradas
            </Typography>
          </SearchContainer>

          {/* Lista de Estações - Com scroll independente */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: '#0f0f0f',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(26, 26, 26, 0.5)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(118, 255, 3, 0.3)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(118, 255, 3, 0.5)',
            },
          }}>
            {filteredAndSortedStations.map((station) => (
              <StyledCard 
                key={station.id}
                isHovered={hoveredStation?.id === station.id}
                onClick={() => handleStationCardClick(station)}
                onMouseEnter={() => handleStationCardHover(station)}
                onMouseLeave={() => setHoveredStation(null)}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1, color: 'white' }}>
                      {station.name}
                    </Typography>
                    <StatusChip
                      label={station.available ? 'Disponível' : 'Indisponível'}
                      size="small"
                      status={station.available ? 'available' : 'unavailable'}
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: '#b0b0b0' }}>
                    <LocationOn fontSize="small" sx={{ color: '#76ff03' }} />
                    {station.location}
                  </Typography>

                  {station.distance && (
                    <Typography variant="body2" sx={{ mb: 2, color: '#76ff03', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      📍 {station.distance.toFixed(1)} km de distância
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <PowerChip
                      label={`${station.power}kW`}
                      size="small"
                      icon={<Power />}
                    />
                    <TypeChip
                      label={getChargingTypeLabel(station.chargingType)}
                      size="small"
                      chargingType={station.chargingType}
                    />
                  </Box>

                  {station.totalPorts && (
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      Portas: <span style={{ color: '#76ff03', fontWeight: 'bold' }}>{station.availablePorts}/{station.totalPorts}</span> disponíveis
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions sx={{ pt: 0, justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <GradientButton 
                    size="small" 
                    startIcon={<ElectricCar />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStation(station);
                      setBookingModalOpen(true);
                    }}
                  >
                    Reservar
                  </GradientButton>
                  <OutlinedButton 
                    size="small" 
                    variant="outlined"
                    startIcon={<Navigation />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    Navegar
                  </OutlinedButton>
                </CardActions>
              </StyledCard>
            ))}

            {filteredAndSortedStations.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 1 }}>
                  Nenhuma estação encontrada
                </Typography>
                <Typography variant="body2" sx={{ color: '#76ff03' }}>
                  Tente ajustar os termos de pesquisa
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Dialog de Detalhes da Estação */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(118, 255, 3, 0.2)',
              borderRadius: '16px',
            }
          }}
        >
          {selectedStation && (
            <>
              <DialogTitle sx={{ pb: 1, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ElectricCar sx={{ color: '#76ff03' }} />
                  {selectedStation.name}
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(118, 255, 3, 0.2)' }}>
                    <Typography variant="subtitle2" sx={{ color: '#b0b0b0', mb: 1 }}>
                      Localização
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'white' }}>
                      <LocationOn fontSize="small" sx={{ color: '#76ff03' }} />
                      {selectedStation.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#b0b0b0' }}>
                      Coordenadas: {selectedStation.latitude}, {selectedStation.longitude}
                    </Typography>
                    {userLocation && selectedStation.distance && (
                      <Typography variant="body2" sx={{ mt: 1, color: '#76ff03', fontWeight: 'bold' }}>
                        📍 {selectedStation.distance.toFixed(1)} km de distância
                      </Typography>
                    )}
                  </Paper>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(118, 255, 3, 0.2)' }}>
                      <Typography variant="h4" sx={{ color: '#76ff03', fontWeight: 'bold' }}>
                        {selectedStation.power}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                        kW de Potência
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(118, 255, 3, 0.2)' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: selectedStation.available ? '#76ff03' : '#ff5252',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedStation.available ? 'Disponível' : 'Indisponível'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                        Estado
                      </Typography>
                    </Paper>
                  </Box>

                  <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(118, 255, 3, 0.2)' }}>
                    <Typography variant="subtitle2" sx={{ color: '#b0b0b0', mb: 1 }}>
                      Tipo de Carregamento
                    </Typography>
                    <TypeChip
                      label={getChargingTypeLabel(selectedStation.chargingType)}
                      chargingType={selectedStation.chargingType}
                    />
                  </Paper>

                  {selectedStation.totalPorts && (
                    <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(118, 255, 3, 0.2)' }}>
                      <Typography variant="subtitle2" sx={{ color: '#b0b0b0', mb: 1 }}>
                        Disponibilidade de Portas
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" sx={{ color: '#76ff03', fontWeight: 'bold' }}>
                          {selectedStation.availablePorts}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          de {selectedStation.totalPorts} portas disponíveis
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ backgroundColor: '#1a1a1a', borderTop: '1px solid rgba(118, 255, 3, 0.2)' }}>
                <OutlinedButton onClick={() => setDialogOpen(false)}>
                  Fechar
                </OutlinedButton>
                <OutlinedButton 
                  startIcon={<ElectricCar />}
                  onClick={() => {
                    setBookingModalOpen(true);
                  }}
                >
                  Reservar
                </OutlinedButton>
                <GradientButton 
                  startIcon={<Navigation />}
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`;
                    window.open(url, '_blank');
                  }}
                >
                  Navegar
                </GradientButton>
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
    </ThemeProvider>
  );
}

export default Map;