// Header.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Box,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Notifications,
  Settings,
  Person,
  ExitToApp
} from '@mui/icons-material';
import logo from '../../Images/logo.png';

const Header = ({ onProfileAction }) => {
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleProfileClick = (action) => {
    setOpenProfileMenu(false);
    onProfileAction(action);
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #2e7d32 60%, #43a047 100%)', boxShadow: 2 }}>
      <Toolbar sx={{ minHeight: 72, px: { xs: 1, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 2,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            <img src={logo} alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </Box>
          <Typography variant="h5" component="div" sx={{ fontWeight: 700, letterSpacing: 1, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Charger Control
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {/* <Badge badgeContent={3} color="error" sx={{ mr: 2 }}>
          <Notifications sx={{ fontSize: 28 }} />
        </Badge> */}
        <Box sx={{ position: 'relative' }}>
          <Box 
            onClick={() => setOpenProfileMenu(!openProfileMenu)}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: 2, 
              cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.10)',
              p: 1.2,
              borderRadius: 2,
              transition: 'background 0.2s',
              boxShadow: openProfileMenu ? 3 : 0,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.18)' }
            }}
          >
            <Avatar sx={{ background: 'linear-gradient(135deg, #43a047 60%, #2e7d32 100%)', color: '#fff', width: 44, height: 44, fontWeight: 700, fontSize: 24 }}>
              <Person />
            </Avatar>
            <Box sx={{ ml: 2, textAlign: 'left' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>Bruno Tavares</Typography>
              <Typography variant="caption" sx={{ color: '#e0e0e0', fontWeight: 400 }}>Operador</Typography>
            </Box>
          </Box>
          {openProfileMenu && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                mt: 1,
                minWidth: 210,
                zIndex: 1000,
                boxShadow: 6,
                borderRadius: 2,
                overflow: 'hidden',
                background: '#fff'
              }}
            >
              <List>
                <ListItem button onClick={() => handleProfileClick('settings')}>
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
  );
};

export default Header;