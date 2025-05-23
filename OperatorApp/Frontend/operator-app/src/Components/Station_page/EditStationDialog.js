// EditStationDialog.jsx
import React from 'react';
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
  MenuItem
} from '@mui/material';

const EditStationDialog = ({ open, onClose, selectedStation, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Estação de Carregamento</DialogTitle>
      <DialogContent>
        {selectedStation && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Nome da Estação" 
                defaultValue={selectedStation.name}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Localização" 
                defaultValue={selectedStation.location}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minHeight: 56 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={selectedStation.status}
                  label="Status"
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                  <MenuItem value="busy">Ocupado</MenuItem>
                  <MenuItem value="maintenance">Manutenção</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minHeight: 56 }}>
                <InputLabel>Tipo de Carregamento</InputLabel>
                <Select
                  defaultValue={selectedStation.type === 'DC Fast' ? 'dc100' : 'ac22'}
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
                defaultValue={selectedStation.power.replace('kW', '')}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Preço por kWh (€)" 
                type="number" 
                step="0.01" 
                defaultValue="0.25"
                sx={{ minHeight: 56 }}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSave} variant="contained" sx={{ backgroundColor: '#2e7d32' }}>
          Guardar Alterações
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStationDialog;