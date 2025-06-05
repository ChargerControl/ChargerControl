// EditStationModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  LocationOn,
  Power,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';

const EditStationModal = ({ open, station, onClose, onStationUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0,
    available: true,
    chargingType: '',
    power: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Opções para tipo de carregamento
  const chargingTypeOptions = [
    { value: 'AC_SLOW', label: 'AC Slow' },
    { value: 'AC_STANDARD', label: 'AC Standard' },
    { value: 'DC_FAST', label: 'DC Fast' },
    { value: 'DC_ULTRA_FAST', label: 'DC Ultra Fast' }
  ];

  // Carregar dados da estação quando o modal abrir
  useEffect(() => {
    if (open && station) {
      setFormData({
        name: station.name || '',
        location: station.location || '',
        latitude: station.latitude || 0,
        longitude: station.longitude || 0,
        available: station.available !== undefined ? station.available : true,
        chargingType: station.chargingType || '',
        power: station.power || 0
      });
      setError('');
      setValidationErrors({});
    }
  }, [open, station]);

  // Função para validar os dados do formulário
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!formData.chargingType) {
      errors.chargingType = 'Charging type is required';
    }
    if (formData.power <= 0) {
      errors.power = 'Power must be greater than 0';
    }
    if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para atualizar a estação
  const updateStation = async (stationId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:8081/apiV1/stations/${stationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Erro HTTP: ${response.status}`;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Verificar se há conteúdo na resposta
      const responseText = await response.text();
      if (responseText) {
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON:', responseText);
          // Se não conseguir fazer parse, retorna os dados enviados como fallback
          return updatedData;
        }
      }
      
      // Se não há conteúdo, assume que a operação foi bem-sucedida
      return updatedData;
    } catch (error) {
      console.error('Erro ao atualizar estação:', error);
      throw error;
    }
  };

  // Lidar com mudanças nos campos do formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro de validação específico quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Lidar com o submit do formulário
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedStation = await updateStation(station.id, formData);
      
      // Chamar callback para atualizar a lista no componente pai
      if (onStationUpdated) {
        onStationUpdated({ ...updatedStation, id: station.id });
      }

      // Fechar modal
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lidar com o cancelamento
  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Edit />
          <Typography variant="h6">
            Edit Station #{station?.id}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            {/* Nome da Estação */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Station Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                disabled={loading}
                required
              />
            </Grid>

            {/* Localização */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={!!validationErrors.location}
                helperText={validationErrors.location}
                disabled={loading}
                required
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
              <FormControl fullWidth error={!!validationErrors.chargingType} required>
                <InputLabel>Charging Type</InputLabel>
                <Select
                  value={formData.chargingType}
                  label="Charging Type"
                  onChange={(e) => handleInputChange('chargingType', e.target.value)}
                  disabled={loading}
                >
                  {chargingTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.chargingType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {validationErrors.chargingType}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Potência */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Power"
                type="number"
                value={formData.power}
                onChange={(e) => handleInputChange('power', parseFloat(e.target.value) || 0)}
                error={!!validationErrors.power}
                helperText={validationErrors.power}
                disabled={loading}
                required
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kW</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Power />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Latitude */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                error={!!validationErrors.latitude}
                helperText={validationErrors.latitude || 'Between -90 and 90'}
                disabled={loading}
                inputProps={{ min: -90, max: 90, step: 0.000001 }}
              />
            </Grid>

            {/* Longitude */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                error={!!validationErrors.longitude}
                helperText={validationErrors.longitude || 'Between -180 and 180'}
                disabled={loading}
                inputProps={{ min: -180, max: 180, step: 0.000001 }}
              />
            </Grid>

            {/* Status da Estação */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.available}
                    onChange={(e) => handleInputChange('available', e.target.checked)}
                    disabled={loading}
                    color="success"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Station Available</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({formData.available ? 'Online' : 'Offline'})
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleCancel} 
          disabled={loading}
          startIcon={<Cancel />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          sx={{ backgroundColor: '#2e7d32' }}
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStationModal;