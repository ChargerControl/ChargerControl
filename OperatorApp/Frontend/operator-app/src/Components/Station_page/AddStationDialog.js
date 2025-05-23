// AddStationDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';

const AddStationDialog = ({ open, onClose, newStation, onStationChange, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Function to create charging ports based on station type
  const createChargingPorts = (stationType, power) => {
    // Determine number of ports based on station type/power
    let portCount = 1;
    if (power >= 150) portCount = 4;
    else if (power >= 50) portCount = 2;
    
    const ports = [];
    for (let i = 1; i <= portCount; i++) {
      ports.push({
        id: 0, // Will be assigned by backend
        station: "string", // API expects literal "string"
        status: "AVAILABLE",
        energyUsed: 0,
        portIdentifier: `PORT_${i}`
      });
    }
    return ports;
  };

  // Function to call the API
  const createStation = async (stationData) => {
    try {
      const response = await fetch('http://localhost:8080/apiV1/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationData)
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Dados da estação inválidos. Verifique os campos obrigatórios.');
        }
        if (response.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const createdStation = await response.json();
      return createdStation;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique se o servidor está funcionando.');
      }
      throw new Error(err.message || 'Erro ao criar estação');
    }
  };

  // Enhanced save handler
  const handleSave = async () => {
    setError('');
    setSuccess(false);
    
    // Validate required fields
    if (!newStation.name) {
      setError('Nome da estação é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API - only send what API expects
      const stationData = {
        id: 0, // Will be assigned by backend
        name: newStation.name, // Use actual station name from form
        chargingPorts: createChargingPorts(newStation.type, newStation.power)
      };

      console.log('Sending to API:', stationData); // Debug log

      // Call API
      const createdStation = await createStation(stationData);
      
      setSuccess(true);
      
      // Call the original onSave with the server response
      // Wait a moment to show success message
      setTimeout(() => {
        onSave(createdStation);
        setSuccess(false);
        setLoading(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Reset states when dialog closes
  const handleClose = () => {
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Nova Estação de Carregamento</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Estação criada com sucesso!
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome da Estação"
              value={newStation.name}
              onChange={(e) => onStationChange('name', e.target.value)}
              sx={{ minHeight: 56 }}
              required
              error={!newStation.name && error}
              helperText="Este é o único campo obrigatório para a API"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Localização"
              value={newStation.location}
              onChange={(e) => onStationChange('location', e.target.value)}
              sx={{ minHeight: 56 }}
              helperText="Campo informativo (não enviado para API)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ minHeight: 56 }}>
              <InputLabel>Tipo de Carregamento</InputLabel>
              <Select
                value={newStation.type}
                onChange={(e) => onStationChange('type', e.target.value)}
                label="Tipo de Carregamento"
              >
                <MenuItem value="ac11">AC Standard (11kW)</MenuItem>
                <MenuItem value="ac22">AC Standard (22kW)</MenuItem>
                <MenuItem value="dc50">DC Fast (50kW)</MenuItem>
                <MenuItem value="dc100">DC Fast (100kW)</MenuItem>
                <MenuItem value="dc150">DC Ultra Fast (150kW)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Potência (kW)"
              type="number"
              value={newStation.power}
              onChange={(e) => onStationChange('power', e.target.value)}
              sx={{ minHeight: 56 }}
              helperText="Usado para determinar número de portas de carregamento"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Coordenadas GPS"
              placeholder="40.1234, -8.5678"
              value={newStation.coordinates}
              onChange={(e) => onStationChange('coordinates', e.target.value)}
              sx={{ minHeight: 56 }}
              helperText="Campo informativo (não enviado para API)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Preço por kWh (€)"
              type="number"
              step="0.01"
              value={newStation.price}
              onChange={(e) => onStationChange('price', e.target.value)}
              sx={{ minHeight: 56 }}
              helperText="Campo informativo (não enviado para API)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ minHeight: 56 }}>
              <InputLabel>Disponibilidade</InputLabel>
              <Select
                value={newStation.availability}
                onChange={(e) => onStationChange('availability', e.target.value)}
                label="Disponibilidade"
              >
                <MenuItem value="24h">24 horas</MenuItem>
                <MenuItem value="business">Horário comercial</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          sx={{ backgroundColor: '#2e7d32' }}
          disabled={loading}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Criando...
            </Box>
          ) : (
            'Registrar Estação'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStationDialog;