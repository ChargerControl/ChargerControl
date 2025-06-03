import React, { useState, useEffect } from 'react';
import {
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DirectionsCar as DirectionsCarIcon,
  Speed as SpeedIcon,
  Battery80 as BatteryIcon,
  ElectricCar as ElectricCarIcon,
  CalendarToday as CalendarIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Image as ImageIcon
} from '@mui/icons-material';

function Cars() {
  const [addCarDialogOpen, setAddCarDialogOpen] = useState(false);
  const [editCarIndex, setEditCarIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [apiConfig, setApiConfig] = useState(null); // API configuration cache
  const [imagePreview, setImagePreview] = useState(''); // Image preview

  // Vehicle data from API
  const [vehicles, setVehicles] = useState([]);
  
  // New car state - ADDED imageUrl
  const [newCar, setNewCar] = useState({
    model: '',
    brand: '',
    maximumCharge: '',
    carClass: '',
    imageUrl: ''
  });

  // Centralized API configurations
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
    ],
    carsBase: [
      { baseUrl: 'http://localhost:8080', path: '/apiV1/cars' },
      { baseUrl: 'http://localhost:3000', path: '/apiV1/cars' },
      { baseUrl: '', path: '/apiV1/cars' }
    ]
  };

  // Function to validate image URL
  const isValidImageUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  };

  // Function to get default image based on brand
  const getDefaultCarImage = (brand) => {
    const defaultImages = {
      'Tesla': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=200&fit=crop&crop=center',
      'BMW': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=200&fit=crop&crop=center',
      'Mercedes': 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=200&fit=crop&crop=center',
      'Audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=200&fit=crop&crop=center',
      'Volkswagen': 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&h=200&fit=crop&crop=center',
      'Renault': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=200&fit=crop&crop=center'
    };
    return defaultImages[brand] || 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=200&fit=crop&crop=center';
  };

  // Function to get car image
  const getCarImage = (vehicle) => {
    if (vehicle.imageUrl && isValidImageUrl(vehicle.imageUrl)) {
      return vehicle.imageUrl;
    }
    return getDefaultCarImage(vehicle.brand);
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
        
        const response = await fetch(url, requestOptions);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { data, config, url };
          } else if (method === 'DELETE') {
            return { data: null, config, url }; // DELETE may not return JSON
          }
        }
      } catch (error) {
        console.log(`Error testing ${config.baseUrl}${config.path}:`, error.message);
      }
    }
    
    throw new Error('No valid URL found for the API');
  };

  // Optimized function to get user ID (runs only once)
  const getCurrentUserId = async () => {
    if (currentUserId) {
      return currentUserId; // Return cached ID if it already exists
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

      // Make only one successful request
      const { data: users, config } = await makeAPIRequest(API_CONFIGS.users);
      
      // Save the working configuration
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
      setCurrentUserId(currentUser.id); // Cache the ID
      return currentUser.id;
      
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  };

  // Optimized function to fetch cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await getCurrentUserId();
      
      // Use cached configuration if available, otherwise test all
      const configsToTry = apiConfig?.cars 
        ? [apiConfig.cars] 
        : API_CONFIGS.cars;
      
      const { data: carsData, config } = await makeAPIRequest(configsToTry, userId);
      
      // Save the working configuration
      if (!apiConfig?.cars) {
        setApiConfig(prev => ({ ...prev, cars: config }));
      }
      
      setVehicles(Array.isArray(carsData) ? carsData : [carsData]);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  // Optimized function to add/edit car
  const handleAddCar = async () => {
    try {
      const userId = await getCurrentUserId();
      
      const isEdit = editCarIndex !== null;
      
      if (isEdit) {
        // For editing, use the specific car endpoint
        const baseConfig = apiConfig?.carsBase || API_CONFIGS.carsBase[0];
        const carId = vehicles[editCarIndex].id;
        
        await makeAPIRequest([baseConfig], carId, 'PUT', {
          ...newCar,
          ownerId: userId
        });
      } else {
        // For creating, use the base endpoint
        const baseConfig = apiConfig?.carsBase || API_CONFIGS.carsBase[0];
        
        await makeAPIRequest([baseConfig], null, 'POST', {
          ...newCar,
          ownerId: userId
        });
      }
      
      await fetchCars(); // Re-fetch data
      setAddCarDialogOpen(false);
      setImagePreview(''); // Clear preview
      
    } catch (err) {
      console.error('Error saving car:', err);
      setError(err.message);
    }
  };

  // Optimized function to delete car
  const handleDeleteCar = async (id) => {
    try {
      const baseConfig = apiConfig?.carsBase || API_CONFIGS.carsBase[0];
      
      await makeAPIRequest([baseConfig], id, 'DELETE');
      await fetchCars(); // Re-fetch data
      
    } catch (err) {
      console.error('Error deleting car:', err);
      setError(err.message);
    }
  };

  // Load cars when component mounts (only once)
  useEffect(() => {
    fetchCars();
  }, []);

  const handleAddCarDialogOpen = () => {
    setNewCar({
      model: '',
      brand: '',
      maximumCharge: '',
      carClass: '',
      imageUrl: ''
    });
    setEditCarIndex(null);
    setImagePreview('');
    setAddCarDialogOpen(true);
  };
  
  const handleAddCarDialogClose = () => {
    setAddCarDialogOpen(false);
    setImagePreview('');
  };
  
  const handleCarInputChange = (e) => {
    const { name, value } = e.target;
    setNewCar({
      ...newCar,
      [name]: value
    });

    // Update image preview when URL changes
    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };
  
  const handleEditCar = (index) => {
    const car = vehicles[index];
    setNewCar({
      model: car.model,
      brand: car.brand,
      maximumCharge: car.maximumCharge,
      carClass: car.carClass,
      imageUrl: car.imageUrl || ''
    });
    setEditCarIndex(index);
    setImagePreview(car.imageUrl || '');
    setAddCarDialogOpen(true);
  };

  const getCarBrandColor = (brand) => {
    const colors = {
      'Tesla': '#DC143C',
      'Renault': '#FFD700',
      'BMW': '#0066CC',
      'Audi': '#BB0000',
      'Mercedes': '#000000',
      'Volkswagen': '#1E3A8A',
    };
    return colors[brand] || '#1976d2';
  };

  const getCarClassLabel = (carClass) => {
    const labels = {
      'LUXURY': 'Luxury',
      'SPORT': 'Sport',
      'FAMILY': 'Family',
      'COMPACT': 'Compact',
      'SUV': 'SUV'
    };
    return labels[carClass] || carClass;
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

      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h5" fontWeight="600" gutterBottom>
          My Vehicles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage your electric vehicles and their details
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleAddCarDialogOpen}
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
            }
          }}
        >
          Add Vehicle
        </Button>
      </Box>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <Card 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: 'none'
          }}
        >
          <CardContent>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              No vehicles registered
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first electric vehicle to get started
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleAddCarDialogOpen}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Add First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} justifyContent="center"> 
          {vehicles.map((vehicle, index) => (
            <Grid item xs={12} lg={6} key={vehicle.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                {/* Car Image - MODIFIED to use getCarImage function */}
                <CardMedia
                  component="img"
                  height="200"
                  image={getCarImage(vehicle)}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  sx={{
                    objectFit: 'cover',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}
                  onError={(e) => {
                    // Fallback to default image if URL fails
                    e.target.src = getDefaultCarImage(vehicle.brand);
                  }}
                />

                {/* Brand Badge */}
                <Chip
                  label={vehicle.brand}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: getCarBrandColor(vehicle.brand),
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }}
                />

                {/* Action Buttons */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEditCar(index)}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        color: 'primary.main'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteCar(vehicle.id)}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        color: 'error.main'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Car Title */}
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    {vehicle.brand} {vehicle.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Owner: {vehicle.ownerName || 'N/A'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Car Details */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#4caf50',
                            width: 32,
                            height: 32,
                            mr: 1.5
                          }}
                        >
                          <BatteryIcon sx={{ fontSize: 16, color: 'white' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Max Charge
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {vehicle.maximumCharge} kWh
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#ff9800',
                            width: 32,
                            height: 32,
                            mr: 1.5
                          }}
                        >
                          <DirectionsCarIcon sx={{ fontSize: 16, color: 'white' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Class
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {getCarClassLabel(vehicle.carClass)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: '#2196f3',
                            width: 32,
                            height: 32,
                            mr: 1.5
                          }}
                        >
                          <ElectricCarIcon sx={{ fontSize: 16, color: 'white' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Owner Email
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {vehicle.ownerEmail || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditCar(index)}
                      startIcon={<EditIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          color: 'primary.main'
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Car Dialog - ADDED imageUrl field */}
      <Dialog
        open={addCarDialogOpen}
        onClose={handleAddCarDialogClose}
        fullWidth
        maxWidth="md"
        sx={{ backdropFilter: 'blur(8px)' }}
      >
        <DialogTitle>
          {editCarIndex !== null ? 'Edit Vehicle' : 'Add Vehicle'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={newCar.brand}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={newCar.model}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Charge (kWh)"
                  name="maximumCharge"
                  type="number"
                  value={newCar.maximumCharge}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Car Class"
                  name="carClass"
                  select
                  SelectProps={{
                    native: true,
                  }}
                  value={newCar.carClass}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  required
                >
                  <option value="">Select a class</option>
                  <option value="LUXURY">Luxury</option>
                  <option value="SPORT">Sport</option>
                  <option value="FAMILY">Family</option>
                  <option value="COMPACT">Compact</option>
                  <option value="SUV">SUV</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="imageUrl"
                  value={newCar.imageUrl}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  placeholder="https://example.com/car-image.jpg"
                  helperText="Paste the link to your vehicle's image here (optional)"
                  InputProps={{
                    startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              {/* Image Preview */}
              {imagePreview && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Image Preview:
                    </Typography>
                    <Card sx={{ maxWidth: 400, mx: 'auto' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={isValidImageUrl(imagePreview) ? imagePreview : getDefaultCarImage(newCar.brand)}
                        alt="Preview"
                        sx={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = getDefaultCarImage(newCar.brand);
                        }}
                      />
                    </Card>
                    {!isValidImageUrl(imagePreview) && imagePreview && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        Invalid image URL. A default image will be used.
                      </Alert>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddCarDialogClose} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddCar} 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              }
            }}
          > 
            {editCarIndex !== null ? 'Save Changes' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Cars;