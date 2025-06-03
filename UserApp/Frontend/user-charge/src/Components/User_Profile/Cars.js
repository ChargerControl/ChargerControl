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
  useTheme,
  Fade,
  Slide
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DirectionsCar as DirectionsCarIcon,
  Speed as SpeedIcon,
  Battery80 as BatteryIcon,
  ElectricCar as ElectricCarIcon,
  CalendarToday as CalendarIcon} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Cars() {
  const theme = useTheme();
  const [addCarDialogOpen, setAddCarDialogOpen] = useState(false);
  const [editCarIndex, setEditCarIndex] = useState(null);

  // Vehicle data 
  const [vehicles, setVehicles] = useState([
    { 
      id: 1, 
      make: 'Tesla', 
      model: 'Model 3', 
      year: 2022, 
      licensePlate: 'AA-11-BB', 
      batteryCapacity: '82 kWh', 
      chargingType: 'Tipo 2, CCS' 
    },
    { 
      id: 2, 
      make: 'Renault', 
      model: 'Zoe', 
      year: 2021, 
      licensePlate: 'ZZ-22-YY', 
      batteryCapacity: '52 kWh', 
      chargingType: 'Tipo 2' 
    }
  ]);
  
  // New car state
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    batteryCapacity: '',
    chargingType: ''
  });

  const handleAddCarDialogOpen = () => {
    setNewCar({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      batteryCapacity: '',
      chargingType: ''
    });
    setEditCarIndex(null);
    setAddCarDialogOpen(true);
  };
  
  const handleAddCarDialogClose = () => {
    setAddCarDialogOpen(false);
  };
  
  const handleCarInputChange = (e) => {
    const { name, value } = e.target;
    setNewCar({
      ...newCar,
      [name]: value
    });
  };
  
  const handleAddCar = () => {
    if (editCarIndex !== null) {
      // Edit existing car
      const updatedVehicles = [...vehicles];
      updatedVehicles[editCarIndex] = { 
        ...newCar, 
        id: vehicles[editCarIndex].id 
      };
      setVehicles(updatedVehicles);
    } else {
      // Add new car
      const newId = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
      setVehicles([...vehicles, { ...newCar, id: newId }]);
    }
    
    setAddCarDialogOpen(false);
  };
  
  const handleEditCar = (index) => {
    setNewCar({...vehicles[index]});
    setEditCarIndex(index);
    setAddCarDialogOpen(true);
  };
  
  const handleDeleteCar = (id) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  const car = require("../../Images/car.png");

  const getCarBrandColor = (make) => {
    const colors = {
      'Tesla': '#DC143C',
      'Renault': '#FFD700',
      'BMW': '#0066CC',
      'Audi': '#BB0000',
      'Mercedes': '#000000',
      'Volkswagen': '#1E3A8A',
    };
    return colors[make] || theme.palette.primary.main;
  };

  return (
    <Box>
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
            Meus Veículos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Gerencie os seus veículos elétricos registados
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
            Adicionar Veículo
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
              Nenhum veículo registado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Adicione o seu primeiro veículo elétrico para começar
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleAddCarDialogOpen}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Adicionar Primeiro Veículo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} justifyContent="center"> 
          {vehicles.map((vehicle, index) => (
            <Grid item xs={12} lg={6} key={vehicle.id}>
              <Fade in timeout={300 + index * 100}>
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
                  {/* Car Image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={car}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    sx={{
                      objectFit: 'cover',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    }}
                  />

                  {/* Brand Badge */}
                  <Chip
                    label={vehicle.make}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: getCarBrandColor(vehicle.make),
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
                      {vehicle.make} {vehicle.model}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Car Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.light',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <CalendarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Ano
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {vehicle.year}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'success.light',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <BatteryIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Bateria
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {vehicle.batteryCapacity}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'warning.light',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >

                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Matrícula
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="600"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              {vehicle.licensePlate}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'info.light',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <ElectricCarIcon sx={{ fontSize: 16, color: 'info.main' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Carregamento
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {vehicle.chargingType}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: 'secondary.light',
                              width: 32,
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <SpeedIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Velocidade Máx.
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              250 km/h
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
                        Editar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Add/Edit Car Dialog */}
      <Dialog
        open={addCarDialogOpen}
        onClose={handleAddCarDialogClose}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="sm"
        sx={{ backdropFilter: 'blur(8px)' }}
      >
        <DialogTitle>
          {editCarIndex !== null ? 'Editar Veículo' : 'Adicionar Veículo'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marca"
                  name="make"
                  value={newCar.make}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Modelo"
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
                  label="Ano"
                  name="year"
                  type="number"
                  value={newCar.year}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Matrícula"
                  name="licensePlate"
                  value={newCar.licensePlate}
                  onChange={handleCarInputChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacidade da Bateria"
                  name="batteryCapacity"
                  value={newCar.batteryCapacity}
                  onChange={handleCarInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tipo de Carregamento"
                  name="chargingType"
                  value={newCar.chargingType}
                  onChange={handleCarInputChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddCarDialogClose} color="secondary">
            Cancelar
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
            {editCarIndex !== null ? 'Salvar Alterações' : 'Adicionar Veículo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default Cars;