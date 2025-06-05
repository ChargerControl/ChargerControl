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
  Alert,
  Card,
  CardContent,
  Chip,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import Cars from './Cars';
import ChargerInformation from './ChargerInformation';
import UserStats from './UserStats';

// Tema harmonizado com navbar e home
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#76ff03',
      light: '#b2ff59',
      dark: '#64dd17',
    },
    secondary: {
      main: '#1a1a1a',
      light: '#333333',
      dark: '#000000',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(26, 26, 26, 0.9)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
});

// Componentes estilizados
const NeonCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.8) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(118, 255, 3, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(118, 255, 3, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(118, 255, 3, 0.4)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(118, 255, 3, 0.2)',
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #76ff03 30%, #64dd17 90%)',
  color: '#000000',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(118, 255, 3, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #64dd17 30%, #76ff03 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(118, 255, 3, 0.6)',
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderColor: '#76ff03',
  color: '#76ff03',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  borderWidth: '2px',
  background: 'rgba(26, 26, 26, 0.8)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(118, 255, 3, 0.1)',
    borderColor: '#76ff03',
    borderWidth: '2px',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(118, 255, 3, 0.3)',
  },
}));

const NeonTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    '& fieldset': {
      borderColor: 'rgba(118, 255, 3, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(118, 255, 3, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#76ff03',
      boxShadow: '0 0 10px rgba(118, 255, 3, 0.3)',
    },
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
}));

const GlowAvatar = styled(Avatar)(({ theme }) => ({
  border: '3px solid #76ff03',
  boxShadow: '0 0 20px rgba(118, 255, 3, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 30px rgba(118, 255, 3, 0.7), 0 12px 40px rgba(0, 0, 0, 0.4)',
  },
}));

const NeonTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#76ff03',
    },
  },
  '& .Mui-selected': {
    color: '#76ff03 !important',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#76ff03',
    height: '3px',
    borderRadius: '2px',
    boxShadow: '0 0 10px rgba(118, 255, 3, 0.5)',
  },
}));

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

function getTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = parseInt(params.get('tab'), 10);
  return isNaN(tab) ? 0 : tab;
}

function UserProfile() {
  const [tabValue, setTabValue] = useState(getTabFromUrl());
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // User data state
  const [userData, setUserData] = useState({
    name: 'Maria Silva',
    email: 'maria.silva@example.com',
    phone: '+351 912 345 678',
    location: 'Lisbon, Portugal',
    joinDate: 'October 2023'
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

  useEffect(() => {
    // Atualiza a aba se o parâmetro da URL mudar (ex: navegação interna)
    const onPopState = () => {
      setTabValue(getTabFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
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
    setSuccessMessage("Profile updated successfully!");
    
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
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 30%, #2a2a2a 70%, #1a1a1a 100%)',
          pb: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, rgba(118, 255, 3, 0.05) 0%, transparent 70%)',
            zIndex: 1,
          },
        }}
      >
        {/* Header Background */}
        <Box
          sx={{
            height: '200px',
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 26, 0.8) 100%)',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #76ff03, transparent)',
            },
          }}
        />

        <Container maxWidth="lg" sx={{ mt: -12, position: 'relative', zIndex: 2 }}>
          {/* Profile Header Card */}
          <NeonCard sx={{ mb: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm="auto" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        size="small"
                        sx={{ 
                          bgcolor: '#76ff03', 
                          color: '#000000',
                          boxShadow: '0 0 15px rgba(118, 255, 3, 0.5)',
                          '&:hover': { 
                            bgcolor: '#64dd17',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <GlowAvatar
                      src={profileImage}
                      alt={userData.name}
                      sx={{ 
                        width: 120,
                        height: 120,
                      }}
                    />
                  </Badge>
                </Grid>
                
                <Grid item xs={12} sm>
                  <Box sx={{ pl: { sm: 3 }, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      fontWeight="700" 
                      gutterBottom
                      sx={{ 
                        color: 'white',
                        textShadow: '0 0 10px rgba(118, 255, 3, 0.3)'
                      }}
                    >
                      {userData.name}
                    </Typography>
                  </Box>
                </Grid>
              
              </Grid>
            </CardContent>
          </NeonCard>

          {/* Main Content */}
          <NeonCard>
            <CardContent sx={{ p: 0 }}>
              {/* Tabs */}
              <Box sx={{ px: 4, pt: 3 }}>
                <NeonTabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Charger Information" />
                  <Tab label="My Vehicles" />
                  <Tab label="User Stats" />
                </NeonTabs>
                <Divider sx={{ mt: 2, backgroundColor: 'rgba(118, 255, 3, 0.2)' }} />
              </Box>

              {/* Personal Information Tab */}
             

              {/* Charger Information Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 4 }}>
                  <ChargerInformation />
                </Box>
              </TabPanel>

              {/* Cars Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 4 }}>
                  <Cars />
                </Box>
              </TabPanel>

              {/* User Stats Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 4 }}>
                  <UserStats />
                </Box>
              </TabPanel>
            </CardContent>
          </NeonCard>
        </Container>

        {/* Success Message */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSuccessMessage(null)} 
            severity="success" 
            variant="filled"
            sx={{ 
              borderRadius: 2,
              backgroundColor: '#76ff03',
              color: '#000000',
              '& .MuiAlert-icon': {
                color: '#000000',
              }
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default UserProfile;