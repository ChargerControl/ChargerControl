import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Container,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  EventNote as BookingIcon,
  CheckCircle as CompleteIcon,
  Assessment as StatsIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  ElectricCar as ElectricCarIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Tema personalizado consistente com a navbar
const theme = createTheme({
  palette: {
    mode: 'dark',
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
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
});

// Componentes estilizados
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(118, 255, 3, 0.2)',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.95) 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(color || theme.palette.primary.main, 0.3)}`,
  borderRadius: 16,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    borderColor: color || theme.palette.primary.main,
    boxShadow: `0 12px 40px ${alpha(color || theme.palette.primary.main, 0.4)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${color || theme.palette.primary.main}, ${alpha(color || theme.palette.primary.main, 0.5)})`,
  },
}));

const ChartCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(118, 255, 3, 0.2)',
  borderRadius: 16,
  padding: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme, bgcolor }) => ({
  background: `linear-gradient(45deg, ${bgcolor}, ${alpha(bgcolor, 0.7)})`,
  width: 56,
  height: 56,
  boxShadow: `0 4px 20px ${alpha(bgcolor, 0.4)}`,
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #76ff03, #64dd17)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 'bold',
}));

function UserStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);
  const [stats, setStats] = useState({
    cars: [],
    bookings: [],
    totalCars: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalChargingSessions: 0,
    averageSessionDuration: 0,
    mostUsedCar: null,
    thisMonthBookings: 0,
    lastBookingDate: null,
    bookingsByMonth: [],
    carUsageData: [],
    statusDistribution: []
  });

  // Centralized API configurations
  const API_CONFIGS = {
    users: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/user/all' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/apiV1/user/all' },
      { baseUrl: '', path: '/api/v1/user/all' },
      { baseUrl: '', path: '/api/user/all' }
    ],
    cars: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/cars/user' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/cars/user' },
      { baseUrl: '', path: '/apiV1/cars/user' },
      { baseUrl: '', path: '/api/v1/cars/user' },
      { baseUrl: '', path: '/api/cars/user' }
    ],
    bookings: [
      { baseUrl: 'http://192.168.160.7:8080', path: '/apiV1/bookings/user' },
      { baseUrl: 'http://192.168.160.7:3000', path: '/apiV1/bookings/user' },
      { baseUrl: '', path: '/apiV1/bookings/user' },
      { baseUrl: '', path: '/api/v1/bookings/user' },
      { baseUrl: '', path: '/api/bookings/user' }
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
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`Token found with key: ${key}`);
        return token;
      }
    }
    
    throw new Error('Authentication token not found in localStorage');
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
        if (body) {
          console.log('Request body:', JSON.stringify(body, null, 2));
        }
        
        const response = await fetch(url, requestOptions);
        
        console.log('Response status:', response.status);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response data:', data);
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

      console.log('Looking for user with email:', userEmail);

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

  // Function to process bookings data for charts
  const processBookingsData = (bookingsData) => {
    // Status distribution
    const statusCount = {};
    bookingsData.forEach(booking => {
      const status = booking.status || 'UNKNOWN';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      color: getStatusColor(status)
    }));

    // Bookings by month
    const monthlyBookings = {};
    bookingsData.forEach(booking => {
      const date = new Date(booking.bookingTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + 1;
    });

    const bookingsByMonth = Object.entries(monthlyBookings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        bookings: count
      }));

    // Car usage data
    const carUsage = {};
    bookingsData.forEach(booking => {
      if (booking.car) {
        const carKey = `${booking.car.brand} ${booking.car.model}`;
        carUsage[carKey] = (carUsage[carKey] || 0) + 1;
      }
    });

    const carUsageData = Object.entries(carUsage).map(([car, count]) => ({
      car,
      bookings: count
    }));

    return { statusDistribution, bookingsByMonth, carUsageData };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = await getCurrentUserId();

        // Fetch cars and bookings in parallel
        const [carsResult, bookingsResult] = await Promise.all([
          makeAPIRequest(API_CONFIGS.cars, userId).catch(() => ({ data: [] })),
          makeAPIRequest(API_CONFIGS.bookings, userId).catch(() => ({ data: [] }))
        ]);

        const carsData = carsResult.data || [];
        const bookingsData = bookingsResult.data || [];

        // Save working configurations
        if (carsResult.config && !apiConfig?.cars) {
          setApiConfig(prev => ({ ...prev, cars: carsResult.config }));
        }
        if (bookingsResult.config && !apiConfig?.bookings) {
          setApiConfig(prev => ({ ...prev, bookings: bookingsResult.config }));
        }

        // Calculate statistics
        const totalCars = Array.isArray(carsData) ? carsData.length : 0;
        const totalBookings = Array.isArray(bookingsData) ? bookingsData.length : 0;
        
        // Booking analysis
        const completedBookings = bookingsData.filter(b => 
          b.status?.toLowerCase() === 'completed'
        ).length;
        
        const pendingBookings = bookingsData.filter(b => 
          b.status?.toLowerCase() === 'pending'
        ).length;
        
        const cancelledBookings = bookingsData.filter(b => 
          b.status?.toLowerCase() === 'cancelled'
        ).length;

        // This month's bookings
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthBookings = bookingsData.filter(b => {
          const bookingDate = new Date(b.bookingTime);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear;
        }).length;

        // Last booking
        let lastBookingDate = null;
        if (bookingsData.length > 0) {
          const sortedBookings = bookingsData
            .filter(b => b.bookingTime)
            .sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime));
          
          if (sortedBookings.length > 0) {
            lastBookingDate = sortedBookings[0].bookingTime;
          }
        }

        // Most used car (based on bookings)
        const carUsageCount = {};
        bookingsData.forEach(booking => {
          if (booking.car?.id) {
            carUsageCount[booking.car.id] = (carUsageCount[booking.car.id] || 0) + 1;
          }
        });
        
        const mostUsedCarId = Object.keys(carUsageCount).reduce((a, b) => 
          carUsageCount[a] > carUsageCount[b] ? a : b, null
        );
        
        const mostUsedCar = mostUsedCarId ? 
          carsData.find(car => car.id === parseInt(mostUsedCarId)) : null;

        // Average session duration
        const averageSessionDuration = bookingsData.length > 0 ?
          bookingsData.reduce((sum, booking) => sum + (booking.duration || 0), 0) / bookingsData.length : 0;

        // Process data for charts
        const { statusDistribution, bookingsByMonth, carUsageData } = processBookingsData(bookingsData);

        setStats({
          cars: carsData,
          bookings: bookingsData,
          totalCars,
          totalBookings,
          completedBookings,
          pendingBookings,
          cancelledBookings,
          totalChargingSessions: completedBookings,
          averageSessionDuration: Math.round(averageSessionDuration),
          mostUsedCar,
          thisMonthBookings,
          lastBookingDate,
          statusDistribution,
          bookingsByMonth,
          carUsageData
        });

      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(`Error loading user statistics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'No bookings found';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={64} 
              sx={{ 
                color: theme.palette.primary.main,
                mb: 3,
                filter: 'drop-shadow(0 0 20px rgba(118, 255, 3, 0.5))'
              }} 
            />
            <Typography variant="h6" color="white">
              Loading statistics...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: 'md',
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Error
            </Typography>
            <Typography>{error}</Typography>
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <StyledContainer maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <StyledAvatar bgcolor="#76ff03" sx={{ width: 64, height: 64 }}>
              <StatsIcon sx={{ fontSize: 32 }} />
            </StyledAvatar>
          </Box>
          <GradientTypography variant="h3" gutterBottom>
            User Statistics
          </GradientTypography>
          <Typography variant="h6" color="text.secondary">
            Complete dashboard of your activities
          </Typography>
        </Box>

        {/* Main Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StatCard color="#76ff03">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Registered Cars
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#76ff03', fontWeight: 'bold' }}>
                      {stats.totalCars}
                    </Typography>
                  </Box>
                  <StyledAvatar bgcolor="#76ff03">
                    <CarIcon />
                  </StyledAvatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StatCard color="#ff9800">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Total Bookings
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                      {stats.totalBookings}
                    </Typography>
                  </Box>
                  <StyledAvatar bgcolor="#ff9800">
                    <BookingIcon />
                  </StyledAvatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StatCard color="#4caf50">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Completed Sessions
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      {stats.completedBookings}
                    </Typography>
                  </Box>
                  <StyledAvatar bgcolor="#4caf50">
                    <CompleteIcon />
                  </StyledAvatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StatCard color="#9c27b0">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      This Month
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                      {stats.thisMonthBookings}
                    </Typography>
                  </Box>
                  <StyledAvatar bgcolor="#9c27b0">
                    <TrendingIcon />
                  </StyledAvatar>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mb: 6, justifyContent: 'center' }}>
          {/* Status Distribution Chart */}
          <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <ChartCard sx={{ width: '100%', maxWidth: 500 }}>
              <Typography variant="h5" gutterBottom color="white" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #76ff03',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      itemStyle={{ color: 'white' }}
                      labelStyle={{ color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>

          {/* Car Usage Chart */}
          <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <ChartCard sx={{ width: '100%', maxWidth: 900 }}>
              <Typography variant="h5" gutterBottom color="white" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                Car Usage
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.carUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="car" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      wrapperStyle={{ zIndex: 1302 }}
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #76ff03',
                        borderRadius: '8px',
                        color: 'white',
                        position: 'fixed',
                        top: '10%',
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        zIndex: 1302,
                        pointerEvents: 'auto',
                        minWidth: 120,
                        maxWidth: 350,
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                        fontSize: 16
                      }} 
                    />
                    <Bar dataKey="bookings" fill="#76ff03" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Bookings Timeline */}
        {stats.bookingsByMonth.length > 0 && (
          <ChartCard sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom color="white" sx={{ fontWeight: 'bold', mb: 3 }}>
              Bookings by Month
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.bookingsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #76ff03',
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#76ff03" 
                    strokeWidth={3}
                    dot={{ fill: '#76ff03', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        )}

        {/* Additional Info */}
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {/* Most Used Car */}
          {stats.mostUsedCar && (
            <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="white" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Most Used Car
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <StyledAvatar bgcolor="#76ff03" sx={{ width: 64, height: 64 }}>
                      <ElectricCarIcon sx={{ fontSize: 32 }} />
                    </StyledAvatar>
                    <Box>
                      <Typography variant="h6" color="white" sx={{ fontWeight: 'bold' }}>
                        {stats.mostUsedCar.brand} {stats.mostUsedCar.model}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Class: {stats.mostUsedCar.carClass}
                      </Typography>
                      <Chip 
                        label={`Capacity: ${stats.mostUsedCar.maximumCharge} kWh`}
                        sx={{ 
                          bgcolor: alpha('#76ff03', 0.2),
                          color: '#76ff03',
                          border: '1px solid rgba(118, 255, 3, 0.3)'
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          )}
          {/* Summary Info */}
          <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StyledCard>
              <CardContent>
                <Typography variant="h5" gutterBottom color="white" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Summary Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Total Charging Sessions</Typography>
                    <Typography variant="body1" color="white">
                      {stats.totalChargingSessions}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Average Session Duration</Typography>
                    <Typography variant="body1" color="white">
                      {stats.averageSessionDuration} min
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Last Booking</Typography>
                    <Typography variant="body1" color="white">
                      {formatDate(stats.lastBookingDate)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </StyledContainer>
    </ThemeProvider>
  );
}
export default UserStats;