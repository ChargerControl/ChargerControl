// StationsTable.jsx
import React from 'react';
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
  LinearProgress
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Bolt,
  Error,
  LocationOn,
  Settings,
  Timeline
} from '@mui/icons-material';

const StationsTable = ({ stations, onAddStation, onEditStation }) => {
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

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Gestão de Estações</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddStation}
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
                  <IconButton size="small" onClick={() => onEditStation(station)}>
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
    </>
  );
};

export default StationsTable;