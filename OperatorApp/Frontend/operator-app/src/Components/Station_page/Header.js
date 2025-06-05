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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Notifications,
  Settings,
  Person,
  ExitToApp,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import logo from '../../Images/logo.png';

const Header = ({ onProfileAction }) => {
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('Bruno Tavares');
  const [profilePassword, setProfilePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleProfileClick = (action) => {
    setOpenProfileMenu(false);
    if (action === 'settings') {
      setEditProfileOpen(true);
    } else {
      onProfileAction(action);
    }
  };

  const handleProfileSave = () => {
    setProfileError('');
    setProfileSuccess('');
    if (!profileName.trim()) {
      setProfileError('O nome não pode ser vazio.');
      return;
    }
    // Aqui você pode adicionar a chamada à API para atualizar o perfil
    setProfileSuccess('Perfil atualizado com sucesso!');
    setTimeout(() => setEditProfileOpen(false), 1200);
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
                  <ListItemText primary="Edit Profile" />
                </ListItem>
                <Divider />
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToApp />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </Paper>
          )}
          {/* Modal de edição de perfil */}
          <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="Profile Name"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={profilePassword}
                  onChange={e => setProfilePassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  helperText="Leave blank to keep current password"
                />
                {profileError && <Typography color="error" variant="body2">{profileError}</Typography>}
                {profileSuccess && <Typography color="success.main" variant="body2">{profileSuccess}</Typography>}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
              <Button onClick={handleProfileSave} variant="contained" sx={{ backgroundColor: '#2e7d32' }}>Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;