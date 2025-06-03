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
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
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
    <Box
  sx={{
    minHeight: '100vh',
    background: '#1e3c72', // dark blue solid
    pb: 4
  }}
>
  {/* Header Background */}
  <Box
    sx={{
      height: '200px',
      width: '100%',
      position: 'relative',
      background: 'rgba(30, 60, 114, 0.9)', // dark blue with transparency
    }}
  />

      <Container maxWidth="lg" sx={{ mt: -12, position: 'relative', zIndex: 2 }}>
        {/* Profile Header Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mb: 3,
            overflow: 'visible'
          }}
        >
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
                        bgcolor: 'primary.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={profileImage}
                    alt={userData.name}
                    sx={{ 
                      width: 120,
                      height: 120,
                      border: '4px solid white',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
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
                    sx={{ color: 'text.primary' }}
                  >
                    {userData.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {userData.email}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm="auto">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Tabs */}
            <Box sx={{ px: 4, pt: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 48,
                    px: 3
                  },
                  '& .Mui-selected': {
                    color: 'primary.main'
                  }
                }}
              >
                <Tab label="Personal Information" />
                <Tab label="Charger Information" />
                <Tab label="My Vehicles" />
              </Tabs>
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Personal Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" fontWeight="600">
                    Personal Information
                  </Typography>
                  <Button
                    variant={editMode ? "outlined" : "contained"}
                    startIcon={editMode ? <CloseIcon /> : <EditIcon />}
                    onClick={handleEditToggle}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3
                    }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Full Name
                        </Typography>
                      </Box>
                      {editMode ? (
                        <TextField
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          fullWidth
                          variant="outlined"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      ) : (
                        <Typography variant="h6" fontWeight="500">
                          {userData.name}
                        </Typography>
                      )}
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="500">
                        {userData.email}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Phone
                        </Typography>
                      </Box>
                      {editMode ? (
                        <TextField
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          fullWidth
                          variant="outlined"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      ) : (
                        <Typography variant="h6" fontWeight="500">
                          {userData.phone}
                        </Typography>
                      )}
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Location
                        </Typography>
                      </Box>
                      {editMode ? (
                        <TextField
                          name="location"
                          value={editData.location}
                          onChange={handleInputChange}
                          fullWidth
                          variant="outlined"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      ) : (
                        <Typography variant="h6" fontWeight="500">
                          {userData.location}
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                </Grid>

                {editMode && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Charger Information Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 4, textAlign: 'center', py: 8 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Charger Information
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  This section will contain information about your registered chargers.
                </Typography>
              </Box>
            </TabPanel>

            {/* Cars Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 4 }}>
                <Cars />
              </Box>
            </TabPanel>
          </CardContent>
        </Card>
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
          sx={{ borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserProfile;