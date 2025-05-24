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
          {/* Nome da Estação - OBRIGATÓRIO */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome da Estação"
              value={newStation.name}
              onChange={(e) => onStationChange('name', e.target.value)}
              sx={{ minHeight: 56 }}
              required
              error={!newStation.name && error}
              helperText="Campo obrigatório"
            />
          </Grid>

          {/* Localização - OBRIGATÓRIO */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Localização"
              value={newStation.location}
              onChange={(e) => onStationChange('location', e.target.value)}
              sx={{ minHeight: 56 }}
              required
              error={!newStation.location && error}
              helperText="Endereço da estação (obrigatório)"
            />
          </Grid>

          {/* Potência - OBRIGATÓRIO */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Potência (kW)"
              type="number"
              value={newStation.power}
              onChange={(e) => onStationChange('power', e.target.value)}
              sx={{ minHeight: 56 }}
              required
              error={(!newStation.power || newStation.power <= 0) && error}
              helperText="Potência em kW (obrigatório)"
            />
          </Grid>

          {/* Tipo de Carregamento */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ minHeight: 56 }}>
              <InputLabel>Tipo de Carregamento</InputLabel>
              <Select
                value={newStation.type}
                onChange={(e) => onStationChange('type', e.target.value)}
                label="Tipo de Carregamento"
              >
                <MenuItem value="ac3">AC Lento (3kW)</MenuItem>
                <MenuItem value="ac7">AC Lento (7kW)</MenuItem>
                <MenuItem value="ac11">AC Standard (11kW)</MenuItem>
                <MenuItem value="ac22">AC Standard (22kW)</MenuItem>
                <MenuItem value="dc50">DC Fast (50kW)</MenuItem>
                <MenuItem value="dc100">DC Fast (100kW)</MenuItem>
                <MenuItem value="dc150">DC Ultra Fast (150kW)</MenuItem>
                <MenuItem value="dc350">DC Ultra Fast (350kW)</MenuItem>
              </Select>
            </FormControl>
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
              helperText="Número total de portas de carregamento"
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
              helperText="Formato: latitude, longitude"
            />
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