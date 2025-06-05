import React, { useState, useEffect } from 'react';
import HealthService from './HealthService';
import { 
  Container, Grid, Card, CardContent, Typography, 
  Box, CircularProgress, Alert, AlertTitle, Paper, Divider
} from '@mui/material';
import { 
  ElectricalServices, CheckCircle, Warning, 
  Error, BatteryChargingFull, BatteryAlert
} from '@mui/icons-material';

const SystemHealthDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await HealthService.getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar a cada 30 segundos
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" style={{ marginLeft: 20 }}>
          Carregando dados do sistema...
        </Typography>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  const { 
    totalStations, 
    totalChargingPorts, 
    portStatus, 
    rates, 
    systemStatus 
  } = dashboardData || {};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="div">
        Dashboard de Saúde do Sistema
      </Typography>
      
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">
            Status do Sistema: 
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            {systemStatus === 'HEALTHY' ? (
              <>
                <CheckCircle color="success" />
                <Typography variant="h6" color="success.main" sx={{ ml: 1 }}>
                  Saudável
                </Typography>
              </>
            ) : (
              <>
                <Warning color="warning" />
                <Typography variant="h6" color="warning.main" sx={{ ml: 1 }}>
                  Degradado
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Última atualização: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Estações */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Estações
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ElectricalServices fontSize="large" color="primary" />
                <Typography variant="h4" component="div" sx={{ ml: 1 }}>
                  {totalStations || 0}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Estações de carregamento registradas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portas Totais */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Portas de Carregamento
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BatteryChargingFull fontSize="large" color="primary" />
                <Typography variant="h4" component="div" sx={{ ml: 1 }}>
                  {totalChargingPorts || 0}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total de portas de carregamento
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxa de Disponibilidade */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Disponibilidade
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="div">
                  {rates?.availability || '0.00'}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Porcentagem de portas disponíveis
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxa de Utilização */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Utilização
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="div">
                  {rates?.utilization || '0.00'}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Porcentagem de portas em uso
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Status detalhado das portas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status das Portas de Carregamento
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'success.light', 
                      color: 'success.contrastText',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h5">{portStatus?.available || 0}</Typography>
                    <Typography variant="subtitle1">Disponíveis</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'info.light', 
                      color: 'info.contrastText',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h5">{portStatus?.inUse || 0}</Typography>
                    <Typography variant="subtitle1">Em Uso</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'warning.light', 
                      color: 'warning.contrastText',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h5">{portStatus?.unavailable || 0}</Typography>
                    <Typography variant="subtitle1">Indisponíveis</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SystemHealthDashboard;
