
// ReportsTab.jsx
import React from 'react';
import {
  Typography,
  Grid,
  Card,
  Button
} from '@mui/material';
import { Download } from '@mui/icons-material';

const ReportsTab = () => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>Relatórios e Análises</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Uso por Período</Typography>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Relatório Semanal
            </Button>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Relatório Mensal
            </Button>
            <Button variant="outlined" fullWidth>
              Relatório Anual
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Impacto Ambiental</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              CO₂ total poupado este mês: <strong>15.2 toneladas</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Energia renovável: <strong>78%</strong>
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Exportar Relatório Ambiental
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default ReportsTab;
