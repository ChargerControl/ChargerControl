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
  Alert
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

  // Centralized API configurations (same as Cars.js)
  const API_CONFIGS = {
    users: [
      { baseUrl: 'http://localhost:8080', path: '/apiV1/user/all' },
      { baseUrl: 'http://localhost:3000', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/api/v1/user/all' },
      { baseUrl: '', path: '/api/user/all' }
    ],
    cars: [
      { baseUrl: 'http://localhost:8080', path: '/apiV1/cars/user' },
      { baseUrl: 'http://localhost:3000', path: '/apiV1/cars/user' },
      { baseUrl: '', path: '/apiV1/cars/user' },
      { baseUrl: '', path: '/api/v1/cars/user' },
      { baseUrl: '', path: '/api/cars/user' }
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
          // Log error details
          const errorText = await response.text();
          console.error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.log(`Error testing ${config.baseUrl}${config.path}:`, error.message);
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

  useEffect(() => {
    if (open) {
      fetchUserCars();
    }
  }, [open]);

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const jwtToken = getAuthToken();
      
      // Find the selected car object
      const selectedCarObj = cars.find(car => car.id === selectedCar);
      
      const response = await fetch('http://localhost:8080/apiV1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          jwtToken,
          stationId: station.id,
          carId: selectedCarObj ? selectedCarObj.id : selectedCar,
          startTime: startTime.toISOString(),
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const bookingResult = await response.json();
      console.log('Booking successful:', bookingResult);
      onClose();
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}

export default BookingModal;