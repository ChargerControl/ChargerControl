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
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';



function Cars() {

  const [addCarDialogOpen, setAddCarDialogOpen] = useState(false);
  const [editCarIndex, setEditCarIndex] = useState(null);
  


  // Vehicle data 
  const [vehicles, setVehicles] = useState([
    { id: 1, make: 'Tesla', model: 'Model 3', year: 2022, licensePlate: 'AA-11-BB', batteryCapacity: '82 kWh', chargingType: 'Tipo 2, CCS' },
    { id: 2, make: 'Renault', model: 'Zoe', year: 2021, licensePlate: 'ZZ-22-YY', batteryCapacity: '52 kWh', chargingType: 'Tipo 2' }
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
    
    // Auto-dismiss success message after 3 seconds
    setTimeout(() => {

    }, 3000);
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


  return (

       <Box>
            <Grid container spacing={3}>
              
              
              {vehicles.length === 0 ? (
                <Grid item xs={12} sx={{ textAlign: 'center', py: 5 }}>
                  <DirectionsCarIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhum veículo registado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Adicione o seu primeiro veículo elétrico para começar
                  </Typography>
                </Grid>
              ) : (
                vehicles.map((vehicle, index) => (
                  <Grid item xs={1} key={vehicle.id}>
  <Paper
    elevation={26}
    sx={{
      ml:2,
      minWidth:700,
      p: 5,
      borderRadius: 5,
      backgroundColor: 'white',
      position: 'relative',
      overflow: 'hidden',
      mb: 1,
    }}
  >
 
   
      <Box
        sx={{
          width: '100%',
          height: 200,
          mb: 2,
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
        }}
      >
        <img
          src={car}
          alt={`${vehicle.make} ${vehicle.model}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>
  
    <Grid container spacing={2} sx={{dispaly:'flex'}}>
      <Grid item xs={12} sm={6} md={3} sx={{dispaly:'flex',minWidth:100}}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Model
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {vehicle.make} {vehicle.model}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={3} sx={{dispaly:'flex',minWidth:100}}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Year
        </Typography>
        <Typography variant="body1">{vehicle.year}</Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={3} sx={{dispaly:'flex',minWidth:100}}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Licence Plate
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {vehicle.licensePlate}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={3} sx={{dispaly:'flex',minWidth:100}}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Batery Capacity
        </Typography>
        <Typography variant="body1">{vehicle.batteryCapacity}</Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={3} sx={{dispaly:'flex',minWidth:100}}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          class
        </Typography>
        <Typography variant="body1">{vehicle.chargingType}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={3} sx={{dispaly:'flex',minWidth:100,mt:1}}>
        <IconButton size="small" onClick={() => handleEditCar(index)} sx={{ mr: 1 }}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => handleDeleteCar(vehicle.id)} color="error">
        <DeleteIcon fontSize="small" />
      </IconButton>
      </Grid>
    </Grid>
  </Paper>
  
</Grid>


                ))
              )}
              
            </Grid>
            <Button 
                  variant="contained" 
                  onClick={handleAddCarDialogOpen}
                  startIcon={<AddIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 'bold',
                    mt:10
                  }}
                >
                  Add Car
                </Button>
            
            {/* Add/Edit Car Dialog */}
            <Dialog open={addCarDialogOpen} onClose={handleAddCarDialogClose} maxWidth="sm" fullWidth>
              <DialogTitle>
                {editCarIndex !== null ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Model"
                      name="model"
                      value={newCar.model}
                      onChange={handleCarInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Year"
                      name="year"
                      type="number"
                      value={newCar.year}
                      onChange={handleCarInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      margin="dense"
                      InputProps={{
                        inputProps: { min: 2000, max: new Date().getFullYear() + 1 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="licensePlate"
                      name="licensePlate"
                      value={newCar.licensePlate}
                      onChange={handleCarInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="batteryCapacity"
                      name="batteryCapacity"
                      value={newCar.batteryCapacity}
                      onChange={handleCarInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      margin="dense"
                      placeholder="Ex: 52 kWh"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="class"
                      name="class"
                      value={newCar.class}
                      onChange={handleCarInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      margin="dense"
                      placeholder="Ex: Tipo 2, CCS"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleAddCarDialogClose} color="inherit">
                  cancel
                </Button>
                <Button 
                  onClick={handleAddCar} 
                  variant="contained"
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  {editCarIndex !== null ? 'Update' : 'Add'}
                </Button>
              </DialogActions>
            </Dialog>
      </Box>

        
  );
}

export default Cars;