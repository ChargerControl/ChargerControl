// StationsTable.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Divider,
  Snackbar,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Cancel,
  LocationOn,
  Settings,
  Refresh,
  EvStation,
  Delete,
  DeleteOutline,
  Info,
  BatteryChargingFull,
  PowerSettingsNew,
  Edit,
  Add as AddIcon
} from '@mui/icons-material';
import EditStationModal from './EditStationModal';


const StationsTable = ({ stations, onAddStation, onEditStation, onRefresh, onStationDeleted }) => {
  const [chargingPortsDialog, setChargingPortsDialog] = useState({
    open: false,
    stationId: null,
    stationName: '',
    ports: [],
    loading: false,
    error: ''
  });

  const [portDetailsDialog, setPortDetailsDialog] = useState({
    open: false,
    port: null,
    loading: false,
    error: ''
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    station: null,
    loading: false,
    error: ''
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stationToEdit, setStationToEdit] = useState(null);

  // Estado para feedback visual
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estado local das estações para permitir remoção imediata
  const [localStations, setLocalStations] = useState(stations);

  // Estado para modal de criação de porta
  const [addPortDialog, setAddPortDialog] = useState({
    open: false,
    loading: false,
    error: '',
    portIdentifier: '',
    status: 'AVAILABLE',
    energyUsed: 0
  });

  // Atualizar estações locais quando o prop mudar
  React.useEffect(() => {
    setLocalStations(stations);
  }, [stations]);

  // Função para mapear o status baseado no campo 'available'
  const getStationStatus = (available) => {
    return available ? 'online' : 'offline';
  };

  const getStatusColor = (available) => {
    return available ? 'success' : 'error';
  };

  const getStatusIcon = (available) => {
    return available ? <CheckCircle /> : <Cancel />;
  };

  // Função para formatar o tipo de carregamento
  const formatChargingType = (chargingType) => {
    const typeMap = {
      'AC_SLOW': 'AC Lento',
      'AC_STANDARD': 'AC Standard', 
      'DC_FAST': 'DC Rápido',
      'DC_ULTRA_FAST': 'DC Ultra Rápido'
    };
    return typeMap[chargingType] || chargingType;
  };

  // Função para formatar coordenadas
  const formatCoordinates = (latitude, longitude) => {
    if (latitude === 0 && longitude === 0) return 'N/A';
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  // Função para formatar o status da porta de carregamento
  const formatPortStatus = (status) => {
    const statusMap = {
      'AVAILABLE': 'Disponível',
      'OCCUPIED': 'Ocupada',
      'OUT_OF_ORDER': 'Fora de Serviço',
      'MAINTENANCE': 'Manutenção'
    };
    return statusMap[status] || status;
  };

  // Função para obter cor do status da porta
  const getPortStatusColor = (status) => {
    const colorMap = {
      'AVAILABLE': 'success',
      'OCCUPIED': 'warning',
      'OUT_OF_ORDER': 'error',
      'MAINTENANCE': 'info'
    };
    return colorMap[status] || 'default';
  };

  // Função para formatar energia usada
  const formatEnergyUsed = (energyUsed) => {
    if (energyUsed === null || energyUsed === undefined) return 'N/A';
    return `${energyUsed.toFixed(2)} kWh`;
  };

  // Função para buscar portas de carregamento
  const fetchChargingPorts = async (stationId) => {
    try {
      const response = await fetch(`http://localhost:8080/apiV1/chargingports/station/${stationId}`);
      
      if (!response.ok) {
        // Se não for JSON válido (ex: HTML de erro), usar status como mensagem
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Erro HTTP: ${response.status}`;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Verificar se a resposta tem conteúdo antes de fazer parse
      const responseText = await response.text();
      if (!responseText) {
        return []; // Retorna array vazio se não houver conteúdo
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', responseText);
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao buscar portas de carregamento:', error);
      throw error;
    }
  };

  // Função para buscar detalhes de uma porta específica via endpoint da estação
  const fetchPortDetails = async (stationId, portId) => {
    try {
      const response = await fetch(`http://localhost:8080/apiV1/chargingports/station/${stationId}`);
      
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Nenhum dado retornado');
      }

      try {
        const ports = JSON.parse(responseText);
        const port = ports.find(p => p.id === portId);
        if (!port) {
          throw new Error('Porta não encontrada');
        }
        return port;
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', responseText);
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da porta:', error);
      throw error;
    }
  };

  // Função para eliminar porta de carregamento
  const deleteChargingPort = async (portId) => {
    try {
      const response = await fetch(`http://localhost:8080/apiV1/chargingports/${portId}`, {
        method: 'DELETE'
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
    } catch (error) {
      console.error('Erro ao eliminar porta de carregamento:', error);
      throw error;
    }
  };

  // Função para eliminar estação
  const deleteStation = async (stationId) => {
    try {
      const response = await fetch(`http://localhost:8080/apiV1/stations/${stationId}`, {
        method: 'DELETE'
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
    } catch (error) {
      console.error('Erro ao eliminar estação:', error);
      throw error;
    }
  };

  // Abrir modal de edição
  const handleEditStation = (station) => {
    setStationToEdit(station);
    setEditModalOpen(true);
  };

  // Fechar modal de edição
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setStationToEdit(null);
  };

  // Estação atualizada
  const handleStationUpdated = (updatedStation) => {
    setLocalStations(prev =>
      prev.map(st => st.id === updatedStation.id ? updatedStation : st)
    );
    setSnackbar({
      open: true,
      message: 'Estação atualizada com sucesso',
      severity: 'success'
    });
  };

  // Abrir modal de portas de carregamento
  const handleOpenChargingPorts = async (station) => {
    setChargingPortsDialog({
      open: true,
      stationId: station.id,
      stationName: station.name,
      ports: [],
      loading: true,
      error: ''
    });

    try {
      const ports = await fetchChargingPorts(station.id);
      setChargingPortsDialog(prev => ({
        ...prev,
        ports: Array.isArray(ports) ? ports : [],
        loading: false
      }));
    } catch (error) {
      setChargingPortsDialog(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Fechar modal de portas de carregamento
  const handleCloseChargingPorts = () => {
    setChargingPortsDialog({
      open: false,
      stationId: null,
      stationName: '',
      ports: [],
      loading: false,
      error: ''
    });
  };

  // Abrir modal de detalhes da porta
  const handleOpenPortDetails = async (port) => {
    setPortDetailsDialog({
      open: true,
      port: port,
      loading: true,
      error: ''
    });

    try {
      const portDetails = await fetchPortDetails(chargingPortsDialog.stationId, port.id);
      setPortDetailsDialog(prev => ({
        ...prev,
        port: portDetails,
        loading: false
      }));
    } catch (error) {
      setPortDetailsDialog(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Fechar modal de detalhes da porta
  const handleClosePortDetails = () => {
    setPortDetailsDialog({
      open: false,
      port: null,
      loading: false,
      error: ''
    });
  };

  // Eliminar porta de carregamento
  const handleDeleteChargingPort = async (portId) => {
    try {
      await deleteChargingPort(portId);
      
      // Atualizar lista removendo a porta eliminada
      setChargingPortsDialog(prev => ({
        ...prev,
        ports: prev.ports.filter(port => port.id !== portId)
      }));

      // Mostrar feedback de sucesso
      setSnackbar({
        open: true,
        message: 'Porta de carregamento eliminada com sucesso',
        severity: 'success'
      });
    } catch (error) {
      setChargingPortsDialog(prev => ({
        ...prev,
        error: error.message
      }));
      
      // Mostrar feedback de erro
      setSnackbar({
        open: true,
        message: `Erro ao eliminar porta: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Abrir modal de confirmação de eliminação da estação
  const handleOpenDeleteStation = (station) => {
    setDeleteDialog({
      open: true,
      station: station,
      loading: false,
      error: ''
    });
  };

  // Fechar modal de confirmação de eliminação
  const handleCloseDeleteStation = () => {
    setDeleteDialog({
      open: false,
      station: null,
      loading: false,
      error: ''
    });
  };

  // Confirmar eliminação da estação
  const handleConfirmDeleteStation = async () => {
    if (!deleteDialog.station?.id) return;

    setDeleteDialog(prev => ({ ...prev, loading: true, error: '' }));

    try {
      await deleteStation(deleteDialog.station.id);
      
      // Remover estação da lista local imediatamente para feedback visual
      setLocalStations(prev => prev.filter(station => station.id !== deleteDialog.station.id));
      
      // Chamar callback para atualizar a lista no componente pai
      if (onStationDeleted) {
        onStationDeleted(deleteDialog.station.id);
      }
      
      // Mostrar feedback de sucesso
      setSnackbar({
        open: true,
        message: `Estação "${deleteDialog.station.name}" eliminada com sucesso`,
        severity: 'success'
      });
      
      handleCloseDeleteStation();
    } catch (error) {
      setDeleteDialog(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      // Mostrar feedback de erro
      setSnackbar({
        open: true,
        message: `Erro ao eliminar estação: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Função para criar nova porta
  const handleOpenAddPort = () => {
    setAddPortDialog({
      open: true,
      loading: false,
      error: '',
      portIdentifier: '',
      status: 'AVAILABLE',
      energyUsed: 0
    });
  };
  const handleCloseAddPort = () => {
    setAddPortDialog(prev => ({ ...prev, open: false, error: '' }));
  };
  const handleAddPortChange = (field, value) => {
    setAddPortDialog(prev => ({ ...prev, [field]: value }));
  };
  const handleAddPortSubmit = async () => {
    setAddPortDialog(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await fetch(`http://localhost:8080/apiV1/chargingports/station/${chargingPortsDialog.stationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portIdentifier: addPortDialog.portIdentifier,
          status: addPortDialog.status,
          energyUsed: Number(addPortDialog.energyUsed)
        })
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
      // Atualizar lista de portas
      const ports = await fetchChargingPorts(chargingPortsDialog.stationId);
      setChargingPortsDialog(prev => ({ ...prev, ports: Array.isArray(ports) ? ports : [] }));
      setAddPortDialog({
        open: false,
        loading: false,
        error: '',
        portIdentifier: '',
        status: 'AVAILABLE',
        energyUsed: 0
      });
      setSnackbar({
        open: true,
        message: 'Porta criada com sucesso',
        severity: 'success'
      });
    } catch (error) {
      setAddPortDialog(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };

  return (
    <>
      <EditStationModal
        open={editModalOpen}
        station={stationToEdit}
        onClose={handleCloseEditModal}
        onStationUpdated={handleStationUpdated}
      />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Gestão de Estações ({localStations.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Atualizar lista">
            <IconButton onClick={onRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddStation}
            sx={{ backgroundColor: '#2e7d32' }}
          >
            Nova Estação
          </Button>
        </Box>
      </Box>

      {/* Tabela de Estações */}
      {localStations.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: '#f9f9f9',
          borderRadius: 1,
          border: '1px dashed #ddd'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma estação encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Adicione sua primeira estação de carregamento
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddStation}
            sx={{ backgroundColor: '#2e7d32' }}
          >
            Adicionar Estação
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Localização</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Potência</strong></TableCell>
                <TableCell><strong>Coordenadas</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localStations.map((station) => (
                <TableRow key={station.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{station.id}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {station.name}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {station.location}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(station.available)}
                      label={station.available ? 'Online' : 'Offline'}
                      color={getStatusColor(station.available)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatChargingType(station.chargingType)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {station.power} kW
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatCoordinates(station.latitude, station.longitude)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Ver portas de carregamento">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenChargingPorts(station)}
                          color="info"
                        >
                          <EvStation />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar estação">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditStation(station)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar estação">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDeleteStation(station)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal das Portas de Carregamento */}
      <Dialog 
        open={chargingPortsDialog.open} 
        onClose={handleCloseChargingPorts} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            Portas de Carregamento - {chargingPortsDialog.stationName}
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Adicionar nova porta">
              <IconButton color="primary" onClick={handleOpenAddPort} size="small">
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          {chargingPortsDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {chargingPortsDialog.error}
            </Alert>
          )}
          
          {chargingPortsDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : chargingPortsDialog.ports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma porta de carregamento encontrada
              </Typography>
            </Box>
          ) : (
            <List>
              {chargingPortsDialog.ports.map((port, index) => (
                <React.Fragment key={port.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            Porta #{port.id}
                          </Typography>
                          <Chip
                            label={formatPortStatus(port.status)}
                            color={getPortStatusColor(port.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={null}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            edge="end"
                            color="info"
                            onClick={() => handleOpenPortDetails(port)}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar porta">
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleDeleteChargingPort(port.id)}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < chargingPortsDialog.ports.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChargingPorts}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalhes da Porta */}
      <Dialog 
        open={portDetailsDialog.open} 
        onClose={handleClosePortDetails} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EvStation />
            Detalhes da Porta
          </Box>
        </DialogTitle>
        <DialogContent>
          {portDetailsDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {portDetailsDialog.error}
            </Alert>
          )}
          
          {portDetailsDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : portDetailsDialog.port && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Porta #{portDetailsDialog.port.id}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PowerSettingsNew sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Status
                              </Typography>
                              <Chip
                                label={formatPortStatus(portDetailsDialog.port.status)}
                                color={getPortStatusColor(portDetailsDialog.port.status)}
                                size="small"
                              />
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BatteryChargingFull sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Energia Utilizada
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {formatEnergyUsed(portDetailsDialog.port.energyUsed)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Identificador da Porta
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {portDetailsDialog.port.portIdentifier || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePortDetails}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de criação de nova porta */}
      <Dialog open={addPortDialog.open} onClose={handleCloseAddPort} maxWidth="xs" fullWidth>
        <DialogTitle>Adicionar Nova Porta</DialogTitle>
        <DialogContent>
          {addPortDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>{addPortDialog.error}</Alert>
          )}
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Identificador da Porta"
              value={addPortDialog.portIdentifier}
              onChange={e => handleAddPortChange('portIdentifier', e.target.value)}
              required
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={addPortDialog.status}
              onChange={e => handleAddPortChange('status', e.target.value)}
              fullWidth
            >
              <MenuItem value="AVAILABLE">Disponível</MenuItem>
              <MenuItem value="OCCUPIED">Ocupada</MenuItem>
              <MenuItem value="OUT_OF_ORDER">Fora de Serviço</MenuItem>
              <MenuItem value="MAINTENANCE">Manutenção</MenuItem>
            </TextField>
            <TextField
              label="Energia Utilizada (kWh)"
              type="number"
              value={addPortDialog.energyUsed}
              onChange={e => handleAddPortChange('energyUsed', e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddPort} disabled={addPortDialog.loading}>Cancelar</Button>
          <Button 
            onClick={handleAddPortSubmit} 
            variant="contained" 
            disabled={addPortDialog.loading}
            startIcon={addPortDialog.loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ backgroundColor: '#2e7d32' }}
          >
            {addPortDialog.loading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação de Eliminação da Estação */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteStation}>
        <DialogTitle>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          {deleteDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteDialog.error}
            </Alert>
          )}
          
          <Typography>
            Tem a certeza que deseja eliminar a estação <strong>{deleteDialog.station?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita e eliminará permanentemente a estação e todas as suas portas de carregamento.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteStation} disabled={deleteDialog.loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDeleteStation} 
            color="error" 
            variant="contained"
            disabled={deleteDialog.loading}
          >
            {deleteDialog.loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StationsTable;