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

  // Função para buscar estações da API
  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8081/apiV1/stations');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStations(data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar estações:', err);
      setError('Erro ao carregar estações. Verifique se o servidor está funcionando.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar estações ao montar o componente
  useEffect(() => {
    fetchStations();
  }, []);

  // Calcular estatísticas baseadas nos dados reais
  const calculateStats = () => {
    const totalStations = stations.length;
    const onlineStations = stations.filter(s => s.available).length;
    
    return {
      onlineStations: `${onlineStations}/${totalStations}`,
      todayRevenue: '€559', // Placeholder - seria calculado com dados de transações
      co2Saved: '2.5t', // Placeholder - seria calculado baseado no uso
      activeAlerts: '0' // Placeholder - seria baseado em alertas reais
    };
  };

  const stats = calculateStats();

  // Alertas fictícios (poderiam vir da API também)
  const alerts = [
    { id: 1, type: 'info', message: `${stations.length} estações carregadas com sucesso`, time: new Date().toLocaleTimeString() }
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
              <Tab label="Estações" />
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