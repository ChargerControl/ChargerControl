import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  DialogContentText
} from '@mui/material';
import {
  EvStation as EvStationIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  Euro as EuroIcon,
  Battery80 as BatteryIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Power as PowerIcon,
  FilterList as FilterIcon,
  PlayArrow as ActiveIcon,
  Check as CheckIcon,
  Payment as PaymentIcon,
  Info as InfoIcon

} from '@mui/icons-material';



function ChargerInformation() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [showCancelled, setShowCancelled] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  
  // Cancel booking states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // API configurations
  const API_CONFIGS = {
    users: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/user/all' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/api/v1/user/all' },
      { baseUrl: '', path: '/api/user/all' }
    ],
    bookings: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/bookings/user' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/bookings/user' },
      { baseUrl: '', path: '/apiV1/bookings/user' },
      { baseUrl: '', path: '/api/v1/bookings/user' },
      { baseUrl: '', path: '/api/bookings/user' }
    ],
    cancelBooking: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/bookings' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/bookings' },
      { baseUrl: '', path: '/apiV1/bookings' },
      { baseUrl: '', path: '/api/v1/bookings' },
      { baseUrl: '', path: '/api/bookings' }
    ]
  };

  // Function to decode JWT token
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

  // Function to get token from localStorage
  const getAuthToken = () => {
    const tokenKeys = ['token', 'authToken', 'accessToken', 'jwt', 'jwtToken'];
    
    for (const key of tokenKeys) {
      const token = localStorage?.getItem?.(key);
      if (token) return token;
    }
    
    throw new Error('Authentication token not found');
  };

  // Function to make HTTP requests with automatic retry
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
          } else if (method === 'DELETE') {
            return { data: null, config, url };
          }
        } else {
          const errorText = await response.text();
          console.error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.log(`Error testing ${config.baseUrl}${config.path}:`, error.message);
      }
    }
    
    throw new Error('No valid URL found for the API');
  };

  // Function to get user ID
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

      const { data: users } = await makeAPIRequest(API_CONFIGS.users);
      
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

  // Function to sort bookings by priority
  const sortBookingsByPriority = (bookings) => {
    const statusPriority = {
      'ACTIVE': 1,
      'PENDING': 2,
      'CONFIRMED': 3,
      'COMPLETED': 4,
      'EXPIRED': 5,
      'CANCELLED': 6
    };

    return bookings.sort((a, b) => {
      const priorityA = statusPriority[a.status] || 999;
      const priorityB = statusPriority[b.status] || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort by booking time (newest first)
      return new Date(b.bookingTime) - new Date(a.bookingTime);
    });
  };

  // Function to filter bookings based on current filter settings
  const filterBookings = (bookings) => {
    let filtered = [...bookings];

    // Always show PENDING and ACTIVE
    filtered = bookings.filter(booking => {
      const status = booking.status;
      
      // Always show PENDING and ACTIVE
      if (status === 'PENDING' || status === 'ACTIVE') {
        return true;
      }
      
      // Show CONFIRMED (treat similar to PENDING)
      if (status === 'CONFIRMED') {
        return true;
      }
      
      // Filter CANCELLED based on toggle
      if (status === 'CANCELLED') {
        return showCancelled;
      }
      
      // Filter COMPLETED based on toggle
      if (status === 'COMPLETED') {
        return showCompleted;
      }
      
      // Filter EXPIRED based on toggle
      if (status === 'EXPIRED') {
        return showExpired;
      }
      
      // Show any other status by default
      return true;
    });

    return sortBookingsByPriority(filtered);
  };

  // Function to fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await getCurrentUserId();
      
      const { data: bookingsData } = await makeAPIRequest(API_CONFIGS.bookings, userId);
      
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [bookingsData];
      setBookings(bookingsArray);
      setFilteredBookings(filterBookings(bookingsArray));
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh bookings
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  // Function to cancel a booking
  const handleCancelBooking = async (bookingId) => {
    try {
      setCancelling(true);
      
      const { data } = await makeAPIRequest(API_CONFIGS.cancelBooking, bookingId, 'DELETE');
      
      // Refresh the bookings list after successful cancellation
      await fetchBookings();
      
      // Close dialog
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(`Failed to cancel booking: ${error.message}`);
    } finally {
      setCancelling(false);
    }
  };

  // Function to open cancel confirmation dialog
  const openCancelDialog = (booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  // Function to close cancel dialog
  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  // Update filtered bookings when filters change
  useEffect(() => {
    setFilteredBookings(filterBookings(bookings));
  }, [bookings, showCancelled, showCompleted, showExpired]);

  // Load bookings when component mounts
  useEffect(() => {
    fetchBookings();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Function to calculate end time from start time and duration
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return 'N/A';
    try {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + (duration * 60 * 1000)); // duration in minutes
      return formatDate(end);
    } catch {
      return 'N/A';
    }
  };

  // Function to get status color and icon
  const getStatusInfo = (status) => {
    const statusMap = {
      'CONFIRMED': { color: '#4caf50', icon: CheckCircleIcon, label: 'Confirmed' },
      'PENDING': { color: '#ff9800', icon: PendingIcon, label: 'Pending' },
      'CANCELLED': { color: '#f44336', icon: CancelIcon, label: 'Cancelled' },
      'COMPLETED': { color: '#2196f3', icon: CheckCircleIcon, label: 'Completed' },
      'ACTIVE': { color: '#76ff03', icon: ActiveIcon, label: 'Active' },
      'EXPIRED': { color: '#757575', icon: CancelIcon, label: 'Expired' }
    };
    
    return statusMap[status] || { color: '#757575', icon: PendingIcon, label: status || 'Unknown' };
  };

  // Function to get charger type color
  const getChargerTypeColor = (type) => {
    const colors = {
      'FAST': '#f44336',
      'RAPID': '#ff5722',
      'SLOW': '#4caf50',
      'ULTRA_FAST': '#9c27b0'
    };
    return colors[type] || '#1976d2';
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box 
  sx={{ 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 4,
    position: 'relative'
  }}
>
  {/* Botão Refresh posicionado absolutamente no canto direito */}
  <Button
    variant="outlined"
    startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
    onClick={handleRefresh}
    disabled={refreshing}
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      position: 'absolute',
      right: 0,
      top: 0
    }}
  >
    Refresh
  </Button>
  
  {/* Título e subtítulo centralizados */}
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h5" fontWeight="600" gutterBottom >
      My Charging Sessions
    </Typography>
    <Typography variant="body2" color="text.secondary">
      View and manage your charger bookings and sessions
    </Typography>
  </Box>
</Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.8) 100%)',
          border: '1px solid rgba(118, 255, 3, 0.2)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ color: '#76ff03', mr: 1 }} />
          <Typography variant="h6" fontWeight="600" sx={{ color: 'white' }}>
            Filters
          </Typography>
        </Box>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#76ff03',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#76ff03',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Show Completed
              </Typography>
            }
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#f44336',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#f44336',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Show Cancelled
              </Typography>
            }
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#757575',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#757575',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Show Expired
              </Typography>
            }
          />
          
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={`${filteredBookings.length} of ${bookings.length} bookings`}
              sx={{
                bgcolor: 'rgba(118, 255, 3, 0.2)',
                color: '#76ff03',
                fontWeight: 600
              }}
            />
          </Box>
        </Stack>
        
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, display: 'block' }}>
          * Pending and Active bookings are always shown first
        </Typography>
      </Paper>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <Card 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.8) 100%)',
            border: '1px solid rgba(118, 255, 3, 0.2)'
          }}
        >
          <CardContent>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(118, 255, 3, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                border: '2px solid rgba(118, 255, 3, 0.3)'
              }}
            >
              <EvStationIcon sx={{ fontSize: 48, color: '#76ff03' }} />
            </Box>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: 'white' }}>
              {bookings.length === 0 ? 'No charging sessions found' : 'No bookings match current filters'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {bookings.length === 0 
                ? 'Your charging bookings and sessions will appear here' 
                : 'Try adjusting the filters to see more bookings'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {filteredBookings.map((booking, index) => {
            const statusInfo = getStatusInfo(booking.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Grid item xs={12} md={6} key={booking.id || index}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.8) 100%)',
                    border: `1px solid ${booking.status === 'PENDING' || booking.status === 'ACTIVE' ? 'rgba(118, 255, 3, 0.4)' : 'rgba(118, 255, 3, 0.2)'}`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(118, 255, 3, 0.4)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(118, 255, 3, 0.2)'
                    }
                  }}
                >
                  {/* Priority indicator for PENDING/ACTIVE */}
                  {(booking.status === 'PENDING' || booking.status === 'ACTIVE') && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #76ff03, #4caf50)',
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 3 }}>
                    {/* Header with Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: '#76ff03',
                            color: '#000000',
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          <EvStationIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="700" sx={{ color: 'white' }}>
                            Station {booking.chargingPort?.stationId || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Booking #{booking.id}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Cancel button - only show for non-cancelled and non-completed bookings */}
                        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.status !== 'EXPIRED' && (
                          <IconButton
                            onClick={() => openCancelDialog(booking)}
                            disabled={cancelling}
                            sx={{
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                              color: '#f44336',
                              '&:hover': {
                                bgcolor: 'rgba(244, 67, 54, 0.2)',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                        <Chip
                          icon={<StatusIcon sx={{ fontSize: 16 }} />}
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            bgcolor: statusInfo.color,
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2, backgroundColor: 'rgba(118, 255, 3, 0.2)' }} />

                    {/* Details Grid */}
                    <Grid container spacing={2}>
                      {/* Booking Time (Start Time) */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(118, 255, 3, 0.2)',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <CalendarIcon sx={{ fontSize: 16, color: '#76ff03' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              Start Time
                            </Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                              {formatDate(booking.bookingTime)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Duration */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(255, 152, 0, 0.2)',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <AccessTimeIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              Duration
                            </Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                              {booking.duration ? `${booking.duration} min` : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* End Time (Calculated) */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(244, 67, 54, 0.2)',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <ScheduleIcon sx={{ fontSize: 16, color: '#f44336' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              End Time
                            </Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                              {calculateEndTime(booking.bookingTime, booking.duration)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Port Identifier */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(156, 39, 176, 0.2)',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <PowerIcon sx={{ fontSize: 16, color: '#9c27b0' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              Port
                            </Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                              {booking.chargingPort?.portIdentifier || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Car Model */}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(63, 81, 181, 0.2)',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <CarIcon sx={{ fontSize: 16, color: '#3f51b5' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              Vehicle
                            </Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                              {booking.car ? `${booking.car.brand || ''} ${booking.car.model || ''}`.trim() : 'N/A'}
                            </Typography>
                            {booking.car?.carClass && (
                              <Chip
                                label={booking.car.carClass}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(63, 81, 181, 0.3)',
                                  color: '#3f51b5',
                                  fontWeight: 600,
                                  mt: 0.5,
                                  fontSize: '0.7rem'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Port Status */}
                      {booking.chargingPort?.status && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Chip
                              label={`Port ${booking.chargingPort.status}`}
                              size="small"
                              sx={{
                                bgcolor: booking.chargingPort.status === 'AVAILABLE' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                                color:
                                  booking.chargingPort.status === 'AVAILABLE' ? '#4caf50' : '#ff9800',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                borderRadius: 1,
                                px: 1.5,
                                py: 0.5
                              }}
                            />
                          </Box>
                        </Grid>
                      )}

                      {/* Charger Type */}
                      {booking.chargingPort?.chargerType && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: getChargerTypeColor(booking.chargingPort.chargerType),
                                width: 32,
                                height: 32,
                                mr: 1.5
                              }}
                            >
                              <EvStationIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Charger Type
                              </Typography>
                              <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                                {booking.chargingPort.chargerType}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}

                      {/* Cost */}
                      {booking.cost && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'rgba(255, 193, 7, 0.2)',
                                width: 32,
                                height: 32,
                                mr: 1.5
                              }}
                            >
                              <EuroIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Cost
                              </Typography>
                              <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                                {booking.cost.toFixed(2)} €
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {/* Payment Method */}
                      {booking.paymentMethod && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'rgba(33, 150, 243, 0.2)',
                                width: 32,
                                height: 32,
                                mr: 1.5
                              }}
                            >
                              <PaymentIcon sx={{ fontSize: 16, color: '#2196f3' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Payment Method
                              </Typography>
                              <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                                {booking.paymentMethod}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {/* Additional Info */}
                      {booking.additionalInfo && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'rgba(255, 87, 34, 0.2)',
                                width: 32,
                                height: 32,
                                mr: 1.5
                              }}
                            >
                              <InfoIcon sx={{ fontSize: 16, color: '#ff5722' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Additional Info
                              </Typography>
                              <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                                {booking.additionalInfo}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                    {/* Footer with Booking Time */}
                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Booking Time: {formatDate(booking.bookingTime)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={closeCancelDialog}
        aria-labelledby="cancel-booking-dialog-title"
        aria-describedby="cancel-booking-dialog-description"
      >
        <DialogTitle id="cancel-booking-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon sx={{ color: '#f44336', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: '#f44336' }}>
              Cancel Booking
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-booking-dialog-description">
            Are you sure you want to cancel the booking for {bookingToCancel?.chargingPort?.portIdentifier || 'this port'}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog} color="primary" disabled={cancelling}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleCancelBooking(bookingToCancel.id)} 
            color="error" 
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default ChargerInformation;