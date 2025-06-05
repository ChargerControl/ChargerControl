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
  Box,
  InputAdornment,
  Typography,
  Divider,
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
    'ac11': 'AC_STANDARD',
    'ac22': 'AC_STANDARD',
    'dc50': 'DC_FAST',
    'dc100': 'DC_FAST',
    'dc150': 'DC_ULTRA_FAST',
    'dc350': 'DC_ULTRA_FAST'
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
        totalPorts: parseInt(newStation.totalPorts) || 1,
        availablePorts: parseInt(newStation.totalPorts) || 1
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth data-cy="add-station-dialog">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AddCircleOutline />
          <Typography variant="h6">
            Registrar Nova Estação de Carregamento
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} data-cy="validation-error">
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} data-cy="success-message">
            Estação criada com sucesso!
          </Alert>
        )}
        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Dados da Estação (Todos obrigatórios)
          </Typography>
          <Grid container spacing={3}>
            {/* Nome da Estação */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da Estação"
                value={newStation.name}
                onChange={(e) => onStationChange('name', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                data-cy="station-name-input"
                error={!newStation.name && error}
                helperText={!newStation.name && error ? 'Campo obrigatório' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddCircleOutline />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Localização */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Localização"
                value={newStation.location}
                onChange={(e) => onStationChange('location', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                data-cy="station-location-input"
                error={!newStation.location && error}
                helperText={!newStation.location && error ? 'Endereço da estação (obrigatório)' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Tipo de Carregamento */}
            <Grid item xs={12} md={6}>
              <Box sx={{ minHeight: 56, width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Tipo de Carregamento
                </Typography>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  fullWidth
                  value={newStation.type}
                  onChange={(_e, value) => value && onStationChange('type', value)}
                  sx={{ width: '100%', flexWrap: 'wrap' }}
                  data-cy="station-charging-type-select"
                >
                  <ToggleButton value="ac3" sx={{ flex: 1, minWidth: 120 }}>AC Lento (3kW)</ToggleButton>
                  <ToggleButton value="ac7" sx={{ flex: 1, minWidth: 120 }}>AC Lento (7kW)</ToggleButton>
                  <ToggleButton value="ac11" sx={{ flex: 1, minWidth: 120 }}>AC Standard (11kW)</ToggleButton>
                  <ToggleButton value="ac22" sx={{ flex: 1, minWidth: 120 }}>AC Standard (22kW)</ToggleButton>
                  <ToggleButton value="dc50" sx={{ flex: 1, minWidth: 120 }}>DC Fast (50kW)</ToggleButton>
                  <ToggleButton value="dc100" sx={{ flex: 1, minWidth: 120 }}>DC Fast (100kW)</ToggleButton>
                  <ToggleButton value="dc150" sx={{ flex: 1, minWidth: 120 }}>DC Ultra Fast (150kW)</ToggleButton>
                  <ToggleButton value="dc350" sx={{ flex: 1, minWidth: 120 }}>DC Ultra Fast (350kW)</ToggleButton>
                </ToggleButtonGroup>
                {(!newStation.type && error) && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    Campo obrigatório
                  </Typography>
                )}
              </Box>
            </Grid>
            {/* Potência */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Potência (kW)"
                type="number"
                value={newStation.power}
                onChange={(e) => onStationChange('power', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                data-cy="station-power-input"
                error={(!newStation.power || newStation.power <= 0) && error}
                helperText={(!newStation.power || newStation.power <= 0) && error ? 'Potência em kW (obrigatório)' : ''}
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
            {/* Número total de portas */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Portas"
                type="number"
                value={newStation.totalPorts}
                onChange={(e) => onStationChange('totalPorts', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                data-cy="station-total-ports-input"
                error={(!newStation.totalPorts || newStation.totalPorts <= 0) && error}
                helperText={(!newStation.totalPorts || newStation.totalPorts <= 0) && error ? 'Campo obrigatório' : ''}
                inputProps={{ min: 1 }}
              />
            </Grid>
            {/* Coordenadas GPS */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Coordenadas GPS"
                placeholder="38.7578, -9.1904"
                value={newStation.coordinates}
                onChange={(e) => onStationChange('coordinates', e.target.value)}
                sx={{ minHeight: 56 }}
                required
                data-cy="station-coordinates-input"
                error={!newStation.coordinates && error}
                helperText={!newStation.coordinates && error ? 'Campo obrigatório. Formato: latitude, longitude' : 'Formato: latitude, longitude'}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} startIcon={<Cancel />}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          sx={{ backgroundColor: '#2e7d32' }}
          disabled={loading}
          data-cy="save-station-button"
          startIcon={loading ? <CircularProgress size={20} /> : <AddCircleOutline />}>
          {loading ? 'Registrando...' : 'Registrar Estação'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStationDialog;