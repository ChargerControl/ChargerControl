// ChargingStationDashboard.jsx (Main Component)
import React, { useState } from 'react';
import { Box, Card, Tab, Tabs, CardContent } from '@mui/material';
import Header from '../Station_page/Header';
import StatsCards from '../Station_page/StatsCard';
import AlertsPanel from '../Station_page/AlertsPanel';
import StationsTable from '../Station_page/StationsTable';
import AddStationDialog from '../Station_page/AddStationDialog';
import EditStationDialog from '../Station_page/EditStationDialog';
import ReportsTab from '../Station_page/ReportsTab';
import SettingsTab from '../Station_page/SettingsTab';




const ChargingStationDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAddStation, setOpenAddStation] = useState(false);
  const [openEditStation, setOpenEditStation] = useState(false);
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

  // Data
  const stats = {
    onlineStations: '3/4',
    todayRevenue: '€559',
    co2Saved: '2.5t',
    activeAlerts: '3'
  };

  const alerts = [
    { id: 1, type: 'error', message: 'Estação Porto-Centro offline há 2h', time: '14:30' },
    { id: 2, type: 'warning', message: 'Estação Matosinhos com uso excessivo', time: '13:15' },
    { id: 3, type: 'info', message: 'Manutenção programada para Gaia-Sul amanhã', time: '12:00' }
  ];

  const stations = [
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
  ];

  // Handlers
  const handleProfileAction = (action) => {
    if (action === 'settings') {
      setSelectedTab(2);
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
  };

  const handleEditStation = (station) => {
    setSelectedStation(station);
    setOpenEditStation(true);
  };

  const handleSaveEditStation = () => {
    setOpenEditStation(false);
    setSelectedStation(null);
  };

  const handleNewStationChange = (field, value) => {
    setNewStation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Header onProfileAction={handleProfileAction} />

      <Box sx={{ p: 3 }}>
        <StatsCards stats={stats} />
        <AlertsPanel alerts={alerts} />

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab label="Estações" />
              <Tab label="Relatórios" />
              <Tab label="Configurações" />
            </Tabs>
          </Box>

          <CardContent>
            {selectedTab === 0 && (
              <StationsTable 
                stations={stations}
                onAddStation={() => setOpenAddStation(true)}
                onEditStation={handleEditStation}
              />
            )}
            {selectedTab === 1 && <ReportsTab />}
            {selectedTab === 2 && <SettingsTab />}
          </CardContent>
        </Card>
      </Box>

      <AddStationDialog
        open={openAddStation}
        onClose={() => setOpenAddStation(false)}
        newStation={newStation}
        onStationChange={handleNewStationChange}
        onSave={handleAddStation}
      />

      <EditStationDialog
        open={openEditStation}
        onClose={() => setOpenEditStation(false)}
        selectedStation={selectedStation}
        onSave={handleSaveEditStation}
      />
    </Box>
  );
};

export default ChargingStationDashboard;