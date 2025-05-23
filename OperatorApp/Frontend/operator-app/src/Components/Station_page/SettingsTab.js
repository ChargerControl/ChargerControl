// SettingsTab.jsx
import React from 'react';
import {
  Typography,
  Grid,
  Card,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const SettingsTab = () => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>Configurações do Sistema</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Notificações</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Alertas por Email</InputLabel>
              <Select defaultValue="all">
                <MenuItem value="all">Todos os alertas</MenuItem>
                <MenuItem value="critical">Apenas críticos</MenuItem>
                <MenuItem value="none">Desativado</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Frequência de Relatórios</InputLabel>
              <Select defaultValue="weekly">
                <MenuItem value="daily">Diário</MenuItem>
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensal</MenuItem>
              </Select>
            </FormControl>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Perfil do Operador</Typography>
            <TextField
              fullWidth
              label="Nome"
              defaultValue="Chicão Silva"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              defaultValue="chicao@evcharging.pt"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Telefone"
              defaultValue="+351 912 345 678"
            />
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default SettingsTab;
