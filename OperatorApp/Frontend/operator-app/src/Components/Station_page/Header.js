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