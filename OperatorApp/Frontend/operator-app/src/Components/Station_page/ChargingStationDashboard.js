import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tab,
  Tabs,
  LinearProgress,
  Avatar,
  AppBar,
  Toolbar,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ElectricCar,
  Add,
  Warning,
  CheckCircle,
  Error,
  Bolt,
  LocationOn,
  Timeline,
  Assessment,
  Notifications,
  Settings,
  Refresh,
  Download,
  Nature,
  Person,
  ExitToApp
} from '@mui/icons-material';

import logo from '../../Images/logo.png';

const ChargingStationDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAddStation, setOpenAddStation] = useState(false);
  const [openEditStation, setOpenEditStation] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [newStation, setNewStation] = useState({
    name: '',
    location: '',
    type: '',
    power: '',
    coordinates: '',
    price: '',
    availability: ''
  });
  const [alerts] = useState([
    { id: 1, type: 'error', message: 'Estação Porto-Centro offline há 2h', time: '14:30' },
    { id: 2, type: 'warning', message: 'Estação Matosinhos com uso excessivo', time: '13:15' },
    { id: 3, type: 'info', message: 'Manutenção programada para Gaia-Sul amanhã', time: '12:00' }
  ]);

  const [stations] = useState([
    {
      id: 1,
      name: 'Porto Centro',
      location: 'Rua de Santa Catarina, Porto',
      status: 'online',
      type: 'DC Fast',
      power: '150kW',
      usage: 85,
      revenue: '€342',
      co2Saved: '1.2t'
    },
    {
      id: 2,
      name: 'Matosinhos Mall',
      location: 'Shopping Matosinhos, Matosinhos',
      status: 'busy',
      type: 'AC Standard',
      power: '22kW',
      usage: 100,
      revenue: '€128',
      co2Saved: '0.8t'
    },
    {
      id: 3,
      name: 'Gaia Sul',
      location: 'Av. da República, Vila Nova de Gaia',
      status: 'offline',
      type: 'DC Fast',
      power: '100kW',
      usage: 0,
      revenue: '€0',
      co2Saved: '0t'
    },
    {
      id: 4,
      name: 'Campanhã Station',
      location: 'Estação Campanhã, Porto',
      status: 'online',
      type: 'AC Standard',
      power: '11kW',
      usage: 45,
      revenue: '€89',
      co2Saved: '0.5t'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle />;
      case 'busy': return <Bolt />;
      case 'offline': return <Error />;
      default: return <CheckCircle />;
    }
  };

  const handleAddStation = () => {
    setOpenAddStation(false);
    setNewStation({
      name: '',
      location: '',
      type: '',
      power: '',
      coordinates: '',
      price: '',
      availability: ''
    });
    // Lógica para adicionar nova estação
  };

  const handleEditStation = (station) => {
    setSelectedStation(station);
    setOpenEditStation(true);
  };

  const handleSaveEditStation = () => {
    setOpenEditStation(false);
    setSelectedStation(null);
    // Lógica para salvar edições da estação
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleNewStationChange = (field, value) => {
    setNewStation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <img src={logo} alt="Logo" style={{ width: 65, height: 65, marginRight: 16 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Charger Control
          </Typography>
          <Badge badgeContent={3} color="error">
            <Notifications />
          </Badge>
          <Box sx={{ position: 'relative' }}>
            <Box 
              onClick={() => setOpenProfileMenu(!openProfileMenu)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                ml: 2, 
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                p: 1,
                borderRadius: 1
              }}
            >
              <Avatar sx={{ backgroundColor: '#4caf50' }}>
                <Person />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2">Chicão Silva</Typography>
                <Typography variant="caption">Operador</Typography>
              </Box>
            </Box>
            
            {openProfileMenu && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  mt: 1,
                  minWidth: 200,
                  zIndex: 1000,
                  boxShadow: 3
                }}
              >
                <List>
                  <ListItem button onClick={() => {setSelectedTab(2); setOpenProfileMenu(false);}}>
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText primary="Editar Perfil" />
                  </ListItem>
                  <Divider />
                  <ListItem button onClick={handleLogout}>
                    <ListItemIcon>
                      <ExitToApp />
                    </ListItemIcon>
                    <ListItemText primary="Sair" />
                  </ListItem>
                </List>
              </Paper>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* Resumo Rápido */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#e8f5e8' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Estações Online
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      3/4
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Receita Hoje
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      €559
                    </Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      CO₂ Poupado
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      2.5t
                    </Typography>
                  </Box>
                  <Nature sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#ffebee' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Alertas Ativos
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      3
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertas Importantes */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                Alertas e Notificações
              </Typography>
              <IconButton>
                <Refresh />
              </IconButton>
            </Box>
            <List>
              {alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem>
                    <ListItemIcon>
                      {alert.type === 'error' && <Error color="error" />}
                      {alert.type === 'warning' && <Warning color="warning" />}
                      {alert.type === 'info' && <CheckCircle color="info" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={alert.message}
                      secondary={`Às ${alert.time}`}
                    />
                  </ListItem>
                  {index < alerts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Tabs para diferentes seções */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab label="Estações" />
              <Tab label="Relatórios" />
              <Tab label="Configurações" />
            </Tabs>
          </Box>

          {/* Aba Estações */}
          {selectedTab === 0 && (
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Gestão de Estações</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenAddStation(true)}
                  sx={{ backgroundColor: '#2e7d32' }}
                >
                  Nova Estação
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Localização</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Potência</TableCell>
                      <TableCell>Uso</TableCell>
                      <TableCell>Receita</TableCell>
                      <TableCell>CO₂ Poupado</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stations.map((station) => (
                      <TableRow key={station.id}>
                        <TableCell>{station.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                            {station.location}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(station.status)}
                            label={station.status}
                            color={getStatusColor(station.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{station.type}</TableCell>
                        <TableCell>{station.power}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={station.usage}
                              sx={{ width: 60, mr: 1 }}
                            />
                            {station.usage}%
                          </Box>
                        </TableCell>
                        <TableCell>{station.revenue}</TableCell>
                        <TableCell>{station.co2Saved}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditStation(station)}>
                            <Settings />
                          </IconButton>
                          <IconButton size="small">
                            <Timeline />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}

          {/* Aba Relatórios */}
          {selectedTab === 1 && (
            <CardContent>
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
            </CardContent>
          )}

          {/* Aba Configurações */}
          {selectedTab === 2 && (
            <CardContent>
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
            </CardContent>
          )}
        </Card>
      </Box>

      {/* Dialog para Adicionar Nova Estação */}
      <Dialog open={openAddStation} onClose={() => setOpenAddStation(false)} maxWidth="md" fullWidth>
        <DialogTitle>Registrar Nova Estação de Carregamento</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Nome da Estação" 
                value={newStation.name}
                onChange={(e) => handleNewStationChange('name', e.target.value)}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Localização" 
                value={newStation.location}
                onChange={(e) => handleNewStationChange('location', e.target.value)}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minHeight: 56 }}>
                <InputLabel>Tipo de Carregamento</InputLabel>
                <Select
                  value={newStation.type}
                  onChange={(e) => handleNewStationChange('type', e.target.value)}
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
                onChange={(e) => handleNewStationChange('power', e.target.value)}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Coordenadas GPS" 
                placeholder="40.1234, -8.5678" 
                value={newStation.coordinates}
                onChange={(e) => handleNewStationChange('coordinates', e.target.value)}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Preço por kWh (€)" 
                type="number" 
                step="0.01" 
                value={newStation.price}
                onChange={(e) => handleNewStationChange('price', e.target.value)}
                sx={{ minHeight: 56 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minHeight: 56 }}>
                <InputLabel>Disponibilidade</InputLabel>
                <Select
                  value={newStation.availability}
                  onChange={(e) => handleNewStationChange('availability', e.target.value)}
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
          <Button onClick={() => setOpenAddStation(false)}>Cancelar</Button>
          <Button onClick={handleAddStation} variant="contained" sx={{ backgroundColor: '#2e7d32' }}>
            Registrar Estação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Editar Estação */}
      <Dialog open={openEditStation} onClose={() => setOpenEditStation(false)} maxWidth="md" fullWidth>
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
          <Button onClick={() => setOpenEditStation(false)}>Cancelar</Button>
          <Button onClick={handleSaveEditStation} variant="contained" sx={{ backgroundColor: '#2e7d32' }}>
            Guardar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChargingStationDashboard;