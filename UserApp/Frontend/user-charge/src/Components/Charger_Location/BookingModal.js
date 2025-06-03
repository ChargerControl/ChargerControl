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

  useEffect(() => {
    if (open) {
      fetchUserCars();
    }
  }, [open]);

  const fetchUserCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const jwtToken = localStorage.getItem('jwt');
      const response = await fetch(`http://localhost:8080/apiV1/cars/user/${jwtToken}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user cars');
      }
      const data = await response.json();
      setCars(data);
      if (data.length > 0) {
        setSelectedCar(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching user cars:', err);
      setError('Failed to load your cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const jwtToken = localStorage.getItem('jwt');
      const response = await fetch('http://localhost:8080/apiV1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jwtToken,
          stationId: station.id,
          carId: selectedCar.id,
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
            >
              {cars.map((car) => (
                <MenuItem key={car.id} value={car.id}>
                  {car.make} {car.model} - {car.licensePlate}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </LocalizationProvider>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleBooking} variant="contained" disabled={loading || !selectedCar}>
          {loading ? <CircularProgress size={24} /> : 'Book'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookingModal;