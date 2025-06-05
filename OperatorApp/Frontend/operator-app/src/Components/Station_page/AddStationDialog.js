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
  Alert,
  CircularProgress,
  Box,
  InputAdornment,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  LocationOn,
  Power,
  AddCircleOutline,
  Cancel
} from '@mui/icons-material';

const AddStationDialog = ({ open, onClose, newStation, onStationChange, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Mapeamento dos tipos de carregamento para os valores da API
  const chargingTypeMap = {
    'ac3': 'AC_SLOW',
    'ac7': 'AC_SLOW',
    'ac11': 'AC_FAST',
    'ac22': 'AC_FAST',
    'dc50': 'DC_FAST',
    'dc100': 'DC_FAST',
    'dc150': 'DC_ULTRA_FAST',
    'dc350': 'DC_ULTRA_FAST',
    'tesla': 'TESLA_SUPERCHARGER',
    'ccs': 'CCS',
    'chademo': 'CHADEMO',
    'type2': 'TYPE2'
  };

  // Função para converter coordenadas em latitude e longitude
  const parseCoordinates = (coordinates) => {
    if (!coordinates) return { latitude: 0, longitude: 0 };
    
    const coords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return {
        latitude: coords[0],
        longitude: coords[1]
      };
    }
    return { latitude: 0, longitude: 0 };
  };

  // Função para chamar a API
  const createStation = async (stationData) => {
    try {
      const response = await fetch('http://localhost:8081/apiV1/stations', {
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

  // Handler para salvar com dados corretos da API
  const handleSave = async () => {
    setError('');
    setSuccess(false);
    
    // Validar campos obrigatórios
    if (!newStation.name) {
      setError('Nome da estação é obrigatório.');
      return;
    }
    if (!newStation.location) {
      setError('Localização da estação é obrigatória.');
      return;
    }
    if (!newStation.power || newStation.power <= 0) {
      setError('Potência deve ser maior que 0.');
      return;
    }

    setLoading(true);

    try {
      // Converter coordenadas
      const { latitude, longitude } = parseCoordinates(newStation.coordinates);
      
      // Preparar dados para a API conforme estrutura esperada
      const stationData = {
        name: newStation.name,
        location: newStation.location,
        power: parseInt(newStation.power) || 0,
        latitude: latitude,
        longitude: longitude,
        available: true, // Sempre disponível por padrão
        chargingType: chargingTypeMap[newStation.type] || 'AC_STANDARD',
        totalPorts: 10,        // Valor fixo 10
        availablePorts: 10     // Valor fixo 10
      };

      console.log('Enviando para API:', stationData); // Debug log

      // Chamar API
      const createdStation = await createStation(stationData);
      
      setSuccess(true);
      
      // Chamar onSave original com resposta do servidor
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

  // Reset estados quando dialog fecha
  const handleClose = () => {
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AddCircleOutline />
          <Typography variant="h6">
            Register New Charging Station
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Station created successfully!
          </Alert>
        )}
        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Station Data (All required)
          </Typography>
          <Grid container spacing={3}>
            {/* Station Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Station Name"
                value={newStation.name}
                onChange={(e) => onStationChange('name', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                error={!newStation.name && error}
                helperText={!newStation.name && error ? 'Required field' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddCircleOutline />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Location */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={newStation.location}
                onChange={(e) => onStationChange('location', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                error={!newStation.location && error}
                helperText={!newStation.location && error ? 'Station address (required)' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Charging Type */}
            <Grid item xs={12} md={6}>
              <Box sx={{ minHeight: 56, width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Charging Type
                </Typography>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  fullWidth
                  value={newStation.type}
                  onChange={(_e, value) => value && onStationChange('type', value)}
                  sx={{ width: '100%', flexWrap: 'wrap' }}
                >
                  <ToggleButton value="ac3" sx={{ flex: 1, minWidth: 120 }}>AC Slow (3kW)</ToggleButton>
                  <ToggleButton value="ac11" sx={{ flex: 1, minWidth: 120 }}>AC Fast (11kW)</ToggleButton>
                  <ToggleButton value="dc50" sx={{ flex: 1, minWidth: 120 }}>DC Fast (50kW)</ToggleButton>
                  <ToggleButton value="dc150" sx={{ flex: 1, minWidth: 120 }}>DC Ultra (150kW)</ToggleButton>
                  <ToggleButton value="tesla" sx={{ flex: 1, minWidth: 120 }}>Tesla Supercharger</ToggleButton>
                  <ToggleButton value="ccs" sx={{ flex: 1, minWidth: 120 }}>CCS</ToggleButton>
                  <ToggleButton value="chademo" sx={{ flex: 1, minWidth: 120 }}>CHAdeMO</ToggleButton>
                  <ToggleButton value="type2" sx={{ flex: 1, minWidth: 120 }}>Type 2</ToggleButton>
                </ToggleButtonGroup>
                {(!newStation.type && error) && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    Required field
                  </Typography>
                )}
              </Box>
            </Grid>
            {/* Power */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Power (kW)"
                type="number"
                value={newStation.power}
                onChange={(e) => onStationChange('power', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                error={(!newStation.power || newStation.power <= 0) && error}
                helperText={(!newStation.power || newStation.power <= 0) && error ? 'Power in kW (required)' : ''}
                inputProps={{ min: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Power />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">kW</InputAdornment>
                }}
              />
            </Grid>
            {/* GPS Coordinates */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GPS Coordinates"
                placeholder="38.7578, -9.1904"
                value={newStation.coordinates}
                onChange={(e) => onStationChange('coordinates', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                error={!newStation.coordinates && error}
                helperText={!newStation.coordinates && error ? 'Required field. Format: latitude, longitude' : 'Format: latitude, longitude'}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          sx={{ backgroundColor: '#2e7d32' }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddCircleOutline />}>
          {loading ? 'Registering...' : 'Register Station'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStationDialog;
