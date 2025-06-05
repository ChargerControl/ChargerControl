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
  Typography,
  Paper,
  Chip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BatteryChargingFull, Schedule, Power } from '@mui/icons-material';
import PaymentModal from './PaymentModal'; // Ajuste o caminho conforme necessário

function BookingModal({ open, onClose, station }) {
  const [startTime, setStartTime] = useState(new Date());
  const [duration, setDuration] = useState(60); // Default duration: 60 minutes
  const [selectedCar, setSelectedCar] = useState('');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);
  
  // Novos estados para pagamento
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [bookingDataPending, setBookingDataPending] = useState(null);
  
  // Estados para notificações
  const [notification, setNotification] = useState({
    open: false,
    type: 'success', // 'success' ou 'error'
    title: '',
    message: '',
    details: null
  });

  // Função para calcular energia estimada
  const calculateEstimatedEnergy = () => {
    if (!station || !station.power || !duration) return 0;
    
    // Converter minutos para horas e calcular energia
    const hours = duration / 60;
    const estimatedEnergy = station.power * hours;
    
    return estimatedEnergy;
  };

  // Função para formatar a energia estimada
  const formatEstimatedEnergy = () => {
    const energy = calculateEstimatedEnergy();
    
    if (energy === 0) return '0 kWh';
    
    // Se for menos de 1 kWh, mostrar em Wh
    if (energy < 1) {
      return `${(energy * 1000).toFixed(0)} Wh`;
    }
    
    // Se for número inteiro, não mostrar casas decimais
    if (energy % 1 === 0) {
      return `${energy.toFixed(0)} kWh`;
    }
    
    // Caso contrário, mostrar até 2 casas decimais
    return `${energy.toFixed(2)} kWh`;
  };

  // Centralized API configurations (same as Cars.js)
  const API_CONFIGS = {
    users: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/user/all' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/apiV1/user/all' },
    ],
    cars: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/cars/user' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/cars/user' },
      { baseUrl: '', path: '/apiV1/cars/user' },
    ],
    bookings: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/bookings' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/bookings' },
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

  // Função modificada para abrir modal de pagamento ao invés de criar booking diretamente
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

      // Preparar dados para o pagamento
      const paymentDetails = {
        station: station.name,
        stationId: station.id,
        duration: duration,
        estimatedEnergy: formatEstimatedEnergy(),
        startTime: startTime.toLocaleString('en-GB'),
        car: selectedCarObj ? `${selectedCarObj.brand} ${selectedCarObj.model}` : 'N/A'
      };

      // Armazenar dados da reserva para usar após pagamento
      setBookingDataPending({
        bookingData,
        selectedCarObj,
        paymentDetails
      });

      // Abrir modal de pagamento
      setPaymentModalOpen(true);
      
    } catch (err) {
      console.error('Error preparing booking:', err);
      setError('Failed to prepare booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Função chamada quando pagamento é bem-sucedido
  const handlePaymentSuccess = async (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    
    setPaymentModalOpen(false);
    setLoading(true);
    
    try {
      if (!bookingDataPending) {
        throw new Error('No booking data available');
      }

      const { bookingData, selectedCarObj } = bookingDataPending;

      // Adicionar informações de pagamento aos dados da reserva
      const bookingWithPayment = {
        ...bookingData,
        paymentInfo: {
          transactionId: paymentResult.transactionId,
          amount: paymentResult.amount,
          paymentMethod: paymentResult.paymentMethod,
          status: paymentResult.status
        }
      };

      console.log('Creating booking with payment info:', bookingWithPayment);

      // Try different booking endpoints
      const configsToTry = apiConfig?.bookings 
        ? [apiConfig.bookings] 
        : API_CONFIGS.bookings;

      const { data: bookingResult, config } = await makeAPIRequest(
        configsToTry, 
        null, 
        'POST', 
        bookingWithPayment
      );

      if (!apiConfig?.bookings) {
        setApiConfig(prev => ({ ...prev, bookings: config }));
      }

      console.log('Booking successful:', bookingResult);
      
      // Mostrar notificação de sucesso com informações de pagamento
      showSuccessNotificationWithPayment(bookingResult, selectedCarObj, paymentResult);
      
      // Limpar dados pendentes
      setBookingDataPending(null);
      
      // Fechar modal após um pequeno delay para mostrar a notificação
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err) {
      console.error('Error creating booking after payment:', err);
      showErrorNotification(err);
      setBookingDataPending(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para mostrar notificação de sucesso com informações de pagamento
  const showSuccessNotificationWithPayment = (bookingResult, selectedCarObj, paymentResult) => {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const estimatedEnergy = formatEstimatedEnergy();
    
    setNotification({
      open: true,
      type: 'success',
      title: 'Booking Created Successfully!',
      message: 'Your booking and payment have been confirmed.',
      details: {
        station: station.name,
        car: `${selectedCarObj.brand} ${selectedCarObj.model}`,
        licensePlate: selectedCarObj.licensePlate || 'N/A',
        startTime: startTime.toLocaleString('en-GB'),
        endTime: endTime.toLocaleString('en-GB'),
        duration: `${duration} minutes`,
        estimatedEnergy: estimatedEnergy,
        stationPower: `${station.power} kW`,
        bookingId: bookingResult.id || bookingResult.bookingId || 'N/A',
        // Informações de pagamento
        transactionId: paymentResult.transactionId,
        paymentAmount: `€${paymentResult.amount}`,
        paymentMethod: paymentResult.paymentMethod,
        paymentStatus: paymentResult.status
      }
    });
  };

  // Função para lidar com cancelamento do pagamento
  const handlePaymentCancel = () => {
    setPaymentModalOpen(false);
    setBookingDataPending(null);
  };

  // Função para mostrar notificação de erro
  const showErrorNotification = (error) => {
    let errorMessage = 'An error occurred while creating the booking.';
    let errorDetails = null;

    if (error.details) {
      const errorText = (error.details.message || error.details.error || '').toLowerCase();
      if (errorText.includes('porta') && (errorText.includes('disponivel') || errorText.includes('disponível'))) {
        errorMessage = 'No available port!';
      } else if (errorText.includes('no available') && errorText.includes('port')) {
        errorMessage = 'No available port!';
      } else if (errorText.includes('station full') || errorText.includes('estação cheia')) {
        errorMessage = 'No available port!';
      } else if (errorText.includes('all ports occupied') || errorText.includes('todas as portas ocupadas')) {
        errorMessage = 'No available port!';
      }
    }

    if (errorMessage === 'An error occurred while creating the booking.' && error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid booking data.';
          break;
        case 401:
          errorMessage = 'Not authorized. Please check your login.';
          break;
        case 403:
          errorMessage = 'Access denied.';
          break;
        case 404:
          errorMessage = 'No available port!';
          break;
        case 409:
          if (error.details) {
            const conflictText = (error.details.message || error.details.error || '').toLowerCase();
            if (conflictText.includes('porta') || conflictText.includes('port') || 
                conflictText.includes('disponivel') || conflictText.includes('available')) {
              errorMessage = 'No available port!';
            } else {
              errorMessage = 'Conflict: The station may already be booked for this time.';
            }
          } else {
            errorMessage = 'No available port!';
          }
          break;
        case 422:
          errorMessage = 'No available port!';
          break;
        case 500:
          errorMessage = 'Internal server error.';
          break;
        default:
          errorMessage = `HTTP Error ${error.status}`;
      }

      if (error.details) {
        errorDetails = {
          status: error.status,
          message: error.details.message || error.details.error || 'No details available',
          timestamp: new Date().toLocaleString('en-GB')
        };
      }
    } else if (error.message.includes('token')) {
      errorMessage = 'Authentication problem. Please log in again.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Connection problem. Please check your internet.';
    }

    if (errorMessage === 'No available port!' && !errorDetails) {
      errorDetails = {
        status: error.status || 'N/A',
        message: 'All station ports are occupied at the selected time. Try another time or station.',
        timestamp: new Date().toLocaleString('en-GB')
      };
    }

    setNotification({
      open: true,
      type: 'error',
      title: 'Booking Error',
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

  // Função para fechar notificação
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Book Charging Station: {station?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {/* Informações da Estação */}
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(118, 255, 3, 0.1)', 
                  border: '1px solid rgba(118, 255, 3, 0.3)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Station Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<Power />}
                    label={`${station?.power || 0} kW`}
                    color="primary"
                    size="small"
                  />
                  <Chip 
                    label={station?.chargingType || 'N/A'}
                    color="secondary"
                    size="small"
                  />
                  <Chip 
                    label={station?.available ? 'Available' : 'Unavailable'}
                    color={station?.available ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Paper>

              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              {/* Duration com estimativa de energia */}
              <Box>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 1, max: 1440 }}
                />
                {/* Estimativa de energia */}
                <Paper 
                  sx={{ 
                    mt: 1, 
                    p: 2, 
                    backgroundColor: 'rgba(33, 150, 243, 0.1)', 
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BatteryChargingFull color="primary" />
                    <Typography variant="subtitle2" color="primary">
                      Estimated Energy
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatEstimatedEnergy()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Estimated energy
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {duration} min × {station?.power || 0} kW
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    * Estimate based on the station's maximum power. Actual consumption may vary.
                  </Typography>
                </Paper>
              </Box>

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
            {loading ? <CircularProgress size={24} /> : 'Book & Pay'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Pagamento */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={handlePaymentCancel}
        onPaymentSuccess={handlePaymentSuccess}
        paymentDetails={bookingDataPending?.paymentDetails}
        loading={loading}
      />

      {/* Notificação de Sucesso */}
      <Snackbar
        open={notification.open && notification.type === 'success'}
        autoHideDuration={10000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="success" 
          sx={{ width: '100%', maxWidth: 600 }}
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
                <strong>Station:</strong> {notification.details.station}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Car:</strong> {notification.details.car} ({notification.details.licensePlate})
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Start:</strong> {notification.details.startTime}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>End:</strong> {notification.details.endTime}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Duration:</strong> {notification.details.duration}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Power:</strong> {notification.details.stationPower}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Estimated Energy:</strong> {notification.details.estimatedEnergy}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Booking ID:</strong> {notification.details.bookingId}
              </Typography>
              {/* Informações de pagamento */}
              {notification.details.transactionId && (
                <>
                  <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Payment Details:
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Transaction ID:</strong> {notification.details.transactionId}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Amount:</strong> {notification.details.paymentAmount}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Method:</strong> {notification.details.paymentMethod}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Status:</strong> {notification.details.paymentStatus}
                  </Typography>
                </>
              )}
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
                <strong>Details:</strong> {notification.details.message}
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