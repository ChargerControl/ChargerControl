import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function BookingModal({ open, onClose, station }) {
  const [startTime, setStartTime] = useState(new Date());
  const [duration, setDuration] = useState(60); // Default duration: 60 minutes
  const [selectedCar, setSelectedCar] = useState('');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);
  
  // Estados para notificações
  const [notification, setNotification] = useState({
    open: false,
    type: 'success', // 'success' ou 'error'
    title: '',
    message: '',
    details: null
  });

  // Centralized API configurations (same as Cars.js)
  const API_CONFIGS = {
    users: [
      { baseUrl: 'http://localhost:8080', path: '/apiV1/user/all' },
      { baseUrl: 'http://localhost:3000', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/apiV1/user/all' },
    ],
    cars: [
      { baseUrl: 'http://localhost:8080', path: '/apiV1/cars/user' },
      { baseUrl: 'http://localhost:3000', path: '/apiV1/cars/user' },
      { baseUrl: '', path: '/apiV1/cars/user' },
    ],
    bookings: [
      { baseUrl: 'http://localhost:8080', path: '/apiV1/bookings' },
      { baseUrl: 'http://localhost:3000', path: '/apiV1/bookings' },
      { baseUrl: '', path: '/apiV1/bookings' },
    ]
  };

  // Function to decode JWT token (same as Cars.js)
  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Function to get token from localStorage (same as Cars.js)
  const getAuthToken = () => {
    const tokenKeys = ['token', 'authToken', 'accessToken', 'jwt', 'jwtToken'];
    
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) return token;
    }
    
    throw new Error('Authentication token not found');
  };

  // Function to make HTTP requests with automatic retry (same as Cars.js)
  const makeAPIRequest = async (configs, userId = null, method = 'GET', body = null) => {
    const token = getAuthToken();
    
    for (const config of configs) {
      try {
        const url = userId 
          ? `${config.baseUrl}${config.path}/${userId}`
          : `${config.baseUrl}${config.path}`;
        
        const requestOptions = {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        if (body && (method === 'POST' || method === 'PUT')) {
          requestOptions.body = JSON.stringify(body);
        }
        
        console.log(`Trying ${method} request to:`, url);
        
        const response = await fetch(url, requestOptions);
        
        console.log('Response status:', response.status);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { data, config, url };
          }
        } else {
          // Log error details and throw with response info
          const errorText = await response.text();
          console.error(`HTTP ${response.status}: ${errorText}`);
          
          // Tentar parsear o erro como JSON para obter detalhes
          let errorDetails = null;
          try {
            errorDetails = JSON.parse(errorText);
          } catch (e) {
            errorDetails = { message: errorText };
          }
          
          const error = new Error(`HTTP ${response.status}`);
          error.status = response.status;
          error.details = errorDetails;
          throw error;
        }
      } catch (error) {
        console.log(`Error testing ${config.baseUrl}${config.path}:`, error.message);
        // Se é o último config, re-throw o erro
        if (config === configs[configs.length - 1]) {
          throw error;
        }
      }
    }
    
    throw new Error('No valid URL found for the API');
  };

  // Function to get user ID (same as Cars.js)
  const getCurrentUserId = async () => {
    if (currentUserId) {
      return currentUserId;
    }

    try {
      const token = getAuthToken();
      const decoded = decodeJWT(token);
      
      if (!decoded) {
        throw new Error('Invalid token - could not decode');
      }

      const userEmail = decoded.sub || decoded.email || decoded.username || decoded.user;
      
      if (!userEmail) {
        throw new Error('Email not found in token');
      }

      const { data: users, config } = await makeAPIRequest(API_CONFIGS.users);
      
      setApiConfig(prev => ({ ...prev, users: config }));
      
      const currentUser = users.find(user => 
        user.email === userEmail || 
        user.username === userEmail ||
        user.sub === userEmail
      );
      
      if (!currentUser) {
        throw new Error('User not found in list');
      }

      console.log('User ID found:', currentUser.id);
      setCurrentUserId(currentUser.id);
      return currentUser.id;
      
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  };

  // Updated function to fetch user cars
  const fetchUserCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      
      const configsToTry = apiConfig?.cars 
        ? [apiConfig.cars] 
        : API_CONFIGS.cars;
      
      const { data: carsData, config } = await makeAPIRequest(configsToTry, userId);
      
      if (!apiConfig?.cars) {
        setApiConfig(prev => ({ ...prev, cars: config }));
      }
      
      const carsArray = Array.isArray(carsData) ? carsData : [carsData];
      setCars(carsArray);
      
      if (carsArray.length > 0) {
        setSelectedCar(carsArray[0].id);
      }
    } catch (err) {
      console.error('Error fetching user cars:', err);
      setError('Failed to load your cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Função para mostrar notificação de sucesso
  const showSuccessNotification = (bookingResult, selectedCarObj) => {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    setNotification({
      open: true,
      type: 'success',
      title: 'Reserva Criada com Sucesso!',
      message: 'A sua reserva foi confirmada.',
      details: {
        station: station.name,
        car: `${selectedCarObj.brand} ${selectedCarObj.model}`,
        licensePlate: selectedCarObj.licensePlate || 'N/A',
        startTime: startTime.toLocaleString('pt-PT'),
        endTime: endTime.toLocaleString('pt-PT'),
        duration: `${duration} minutos`,
        bookingId: bookingResult.id || bookingResult.bookingId || 'N/A'
      }
    });
  };

  // Função para mostrar notificação de erro
  const showErrorNotification = (error) => {
    let errorMessage = 'Ocorreu um erro ao criar a reserva.';
    let errorDetails = null;

    // Verificar primeiro se é um erro relacionado com disponibilidade de porta
    if (error.details) {
      const errorText = (error.details.message || error.details.error || '').toLowerCase();
      
      // Verificações para diferentes variações da mensagem de porta não disponível
      if (errorText.includes('porta') && (errorText.includes('disponivel') || errorText.includes('disponível'))) {
        errorMessage = 'Não há porta disponível!';
      } else if (errorText.includes('no available') && errorText.includes('port')) {
        errorMessage = 'Não há porta disponível!';
      } else if (errorText.includes('station full') || errorText.includes('estação cheia')) {
        errorMessage = 'Não há porta disponível!';
      } else if (errorText.includes('all ports occupied') || errorText.includes('todas as portas ocupadas')) {
        errorMessage = 'Não há porta disponível!';
      }
    }

    // Se não foi identificado como problema de porta, usar lógica anterior
    if (errorMessage === 'Ocorreu um erro ao criar a reserva.' && error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Dados da reserva inválidos.';
          break;
        case 401:
          errorMessage = 'Não autorizado. Verifique o seu login.';
          break;
        case 403:
          errorMessage = 'Acesso negado.';
          break;
        case 404:
          errorMessage = 'Não há porta disponível!';
          break;
        case 409:
          // Para conflitos, verificar se é sobre disponibilidade
          if (error.details) {
            const conflictText = (error.details.message || error.details.error || '').toLowerCase();
            if (conflictText.includes('porta') || conflictText.includes('port') || 
                conflictText.includes('disponivel') || conflictText.includes('available')) {
              errorMessage = 'Não há porta disponível!';
            } else {
              errorMessage = 'Conflito: A estação pode já estar reservada neste horário.';
            }
          } else {
            errorMessage = 'Não há porta disponível!'; // Assumir que 409 é geralmente sobre disponibilidade
          }
          break;
        case 422:
          errorMessage = 'Não há porta disponível!'; // Unprocessable Entity - comum para regras de negócio
          break;
        case 500:
          errorMessage = 'Erro interno do servidor.';
          break;
        default:
          errorMessage = `Erro HTTP ${error.status}`;
      }

      if (error.details) {
        errorDetails = {
          status: error.status,
          message: error.details.message || error.details.error || 'Detalhes não disponíveis',
          timestamp: new Date().toLocaleString('pt-PT')
        };
      }
    } else if (error.message.includes('token')) {
      errorMessage = 'Problema de autenticação. Faça login novamente.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Problema de conexão. Verifique a sua internet.';
    }

    // Para o caso específico de "Não há porta disponível", adicionar detalhes específicos
    if (errorMessage === 'Não há porta disponível!' && !errorDetails) {
      errorDetails = {
        status: error.status || 'N/A',
        message: 'Todas as portas da estação estão ocupadas no horário selecionado. Tente outro horário ou estação.',
        timestamp: new Date().toLocaleString('pt-PT')
      };
    }

    setNotification({
      open: true,
      type: 'error',
      title: 'Erro ao Criar Reserva',
      message: errorMessage,
      details: errorDetails
    });
  };

  useEffect(() => {
    if (open) {
      fetchUserCars();
      // Reset notification when opening modal
      setNotification(prev => ({ ...prev, open: false }));
    }
  }, [open]);

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      
      // Find the selected car object
      const selectedCarObj = cars.find(car => car.id === selectedCar);
      
      const bookingData = {
        userId: userId,
        startTime: startTime.toISOString(),
        stationId: station.id,
        carId: selectedCarObj ? selectedCarObj.id : selectedCar,
        duration: duration
      };

      console.log('Booking data:', bookingData);

      // Try different booking endpoints
      const configsToTry = apiConfig?.bookings 
        ? [apiConfig.bookings] 
        : API_CONFIGS.bookings;

      const { data: bookingResult, config } = await makeAPIRequest(
        configsToTry, 
        null, 
        'POST', 
        bookingData
      );

      if (!apiConfig?.bookings) {
        setApiConfig(prev => ({ ...prev, bookings: config }));
      }

      console.log('Booking successful:', bookingResult);
      
      // Mostrar notificação de sucesso
      showSuccessNotification(bookingResult, selectedCarObj);
      
      // Fechar modal após um pequeno delay para mostrar a notificação
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      showErrorNotification(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para fechar notificação
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Book Charging Station: {station?.name}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <TextField
                label="Duration (minutes)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                fullWidth
              />
              <TextField
                select
                label="Select Car"
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                fullWidth
                disabled={loading || cars.length === 0}
              >
                {cars.map((car) => (
                  <MenuItem key={car.id} value={car.id}>
                    {car.brand} {car.model} - {car.licensePlate || 'No License Plate'}
                  </MenuItem>
                ))}
              </TextField>
              {cars.length === 0 && !loading && (
                <Alert severity="info">
                  No cars found. Please add a vehicle first.
                </Alert>
              )}
            </Box>
          </LocalizationProvider>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleBooking} 
            variant="contained" 
            disabled={loading || !selectedCar || cars.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Book'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificação de Sucesso */}
      <Snackbar
        open={notification.open && notification.type === 'success'}
        autoHideDuration={8000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="success" 
          sx={{ width: '100%', maxWidth: 500 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {notification.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {notification.message}
          </Typography>
          {notification.details && (
            <Box sx={{ fontSize: '0.875rem', color: 'success.dark' }}>
              <Typography variant="caption" display="block">
                <strong>Estação:</strong> {notification.details.station}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Veículo:</strong> {notification.details.car} ({notification.details.licensePlate})
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Início:</strong> {notification.details.startTime}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Fim:</strong> {notification.details.endTime}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Duração:</strong> {notification.details.duration}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>ID da Reserva:</strong> {notification.details.bookingId}
              </Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>

      {/* Notificação de Erro */}
      <Snackbar
        open={notification.open && notification.type === 'error'}
        autoHideDuration={10000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="error" 
          sx={{ width: '100%', maxWidth: 500 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {notification.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: notification.details ? 2 : 0 }}>
            {notification.message}
          </Typography>
          {notification.details && (
            <Box sx={{ fontSize: '0.875rem', color: 'error.dark' }}>
              <Typography variant="caption" display="block">
                <strong>Status:</strong> {notification.details.status}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Detalhes:</strong> {notification.details.message}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Timestamp:</strong> {notification.details.timestamp}
              </Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>
    </>
  );
}

export default BookingModal;