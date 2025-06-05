// ChargingStationDashboard.jsx (Main Component)
import React, { useState, useEffect } from 'react';
import { Box, Card, Tab, Tabs, CardContent, CircularProgress, Alert } from '@mui/material';
import Header from '../Station_page/Header';
import StatsCards from '../Station_page/StatsCard';
import StationsTable from '../Station_page/StationsTable';
import AddStationDialog from '../Station_page/AddStationDialog';
import ReportsTab from '../Station_page/ReportsTab';
import SettingsTab from '../Station_page/SettingsTab';

const ChargingStationDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAddStation, setOpenAddStation] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStation, setNewStation] = useState({
    name: '',
    location: '',
    chargingType: 'AC_STANDARD',
    power: '',
    coordinates: '',
    totalPorts: '1'
  });

  // Function to fetch stations from API
  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8081/apiV1/stations');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setStations(data);
      setError('');
    } catch (err) {
      console.error('Error fetching stations:', err);
      setError('Error loading stations. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load stations on component mount
  useEffect(() => {
    fetchStations();
  }, []);

  // Calculate statistics based on real data
  const calculateStats = () => {
    const totalStations = stations.length;
    const onlineStations = stations.filter(s => s.available).length;
    return {
      onlineStations: `${onlineStations}/${totalStations}`,
      todayRevenue: '€559', // Placeholder - should be calculated from transactions data
      co2Saved: '2.5t', // Placeholder - should be calculated based on usage
      activeAlerts: '0' // Placeholder - should be based on real alerts
    };
  };

  const stats = calculateStats();

  // Example alerts (could also come from API)
  const alerts = [
    { id: 1, type: 'info', message: `${stations.length} stations loaded successfully`, time: new Date().toLocaleTimeString() }
  ];

  // Handlers
  const handleProfileAction = (action) => {
    if (action === 'settings') {
      setSelectedTab(2);
    }
  };

  const handleAddStation = async (createdStation) => {
    // Adicionar a nova estação à lista local
    setStations(prev => [...prev, createdStation]);
    setOpenAddStation(false);
    
    // Reset form
    setNewStation({
      name: '',
      location: '',
      chargingType: 'AC_STANDARD',
      power: '',
      coordinates: '',
      totalPorts: '1'
    });
  };

  const handleNewStationChange = (field, value) => {
    setNewStation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefreshStations = () => {
    fetchStations();
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Header onProfileAction={handleProfileAction} />

      <Box sx={{ p: 3 }}>
        <StatsCards stats={stats} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab label="Stations" />
            </Tabs>
          </Box>

          <CardContent>
            {selectedTab === 0 && (
              <>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <StationsTable 
                    stations={stations}
                    onAddStation={() => setOpenAddStation(true)}
                    onRefresh={handleRefreshStations}
                  />
                )}
              </>
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
    </Box>
  );
};

export default ChargingStationDashboard;