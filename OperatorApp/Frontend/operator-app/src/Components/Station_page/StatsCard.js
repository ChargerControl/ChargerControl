// StatsCards.jsx
import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { CheckCircle, Assessment, Nature, Warning } from '@mui/icons-material';


const StatsCards = ({ stats }) => {
  const cardConfigs = [
    {
      title: 'Estações Online',
      value: stats.onlineStations,
      icon: CheckCircle,
      color: 'success.main',
      bgColor: '#e8f5e8'
    },
    {
      title: 'Receita Hoje',
      value: stats.todayRevenue,
      icon: Assessment,
      color: 'warning.main',
      bgColor: '#fff3e0'
    },
    {
      title: 'CO₂ Poupado',
      value: stats.co2Saved,
      icon: Nature,
      color: 'info.main',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Alertas Ativos',
      value: stats.activeAlerts,
      icon: Warning,
      color: 'error.main',
      bgColor: '#ffebee'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cardConfigs.map((config, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ backgroundColor: config.bgColor }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {config.title}
                  </Typography>
                  <Typography variant="h4" color={config.color}>
                    {config.value}
                  </Typography>
                </Box>
                <config.icon sx={{ fontSize: 40, color: config.color }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;