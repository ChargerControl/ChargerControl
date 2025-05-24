import React, { useState, useEffect } from 'react';
import {
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Button, 
  TextField, 
  Container,
  Grid,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import Cars from './Cars';
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function UserProfile() {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // User data state
  const [userData, setUserData] = useState({
    name: 'Maria Silva',
    email: 'maria.silva@example.com',
    phone: '+351 912 345 678',
    location: 'Lisboa, Portugal',
    joinDate: 'Outubro 2023'
  });

  const [editData, setEditData] = useState({...userData});

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail") || "";
    const userName = localStorage.getItem("userName") || "";
    
    if (userEmail && userName) {
      setUserData(prev => ({
        ...prev,
        email: userEmail,
        name: userName
      }));
      setEditData(prev => ({
        ...prev,
        email: userEmail,
        name: userName
      }));
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditData({...userData});
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleSaveProfile = () => {
    setUserData({...editData});
    setEditMode(false);
    setSuccessMessage("Perfil atualizado com sucesso!");
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.setItem("isLoggedIn", "false");
    window.dispatchEvent(new Event("storage"));
  };

  const profileImage = require("../../Images/zezinho.png");


  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        pb: 5
      }}
    >
      <Box
        sx={{
          height: '250px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          },
        }}
      >
        
        
        
      </Box>

      <Container maxWidth="md" sx={{ mt: -10, position: 'relative', zIndex: 2 }}>
        {/* Profile Header Card */}
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            mb: 3,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm="auto" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                
              >
                <Avatar
                  src={profileImage}
                  alt={userData.name}
                  sx={{ 
                    width: { xs: 100, sm: 120 }, 
                    height: { xs: 100, sm: 120 },
                    border: '4px solid white'
                  }}
                />
              </Badge>
            </Grid>
            
            <Grid item xs={12} sm>
              <Box sx={{ pl: { sm: 2 }, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  {userData.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userData.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Join date: {userData.joinDate}
                </Typography>
              </Box>
            </Grid>
            
            
          </Grid>
        </Paper>

        {/* Main Content Section */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: 'white',
          }}
        >
          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Personal Information" />
              <Tab label="Charger information" />
              <Tab label="Cars" />
            </Tabs>
          </Box>

          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={10}>
              

              <Grid item xs={20} md={10}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Name
                </Typography>
                
                  <Typography variant="body1" gutterBottom>
                    {userData.name}
                  </Typography>
     
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                
                  <Typography variant="body1" gutterBottom>
                    {userData.email}
                  </Typography>
              
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Telefone
                </Typography>
                
                  <Typography variant="body1" gutterBottom>
                    {userData.phone}
                  </Typography>
            
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Location
                </Typography>
                {editMode ? (
                  <TextField
                    name="location"
                    value={editData.location}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <Typography variant="body1" gutterBottom>
                    {userData.location}
                  </Typography>
                )}
              </Grid>

              
              
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                //ir buscar charger info para aqui
              </Typography>
              
            </Box>
          </TabPanel>

   
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Cars></Cars>
            </Grid>
          </TabPanel>
        </Paper>

        
      </Container>
    </Box>
  );
}

export default UserProfile;