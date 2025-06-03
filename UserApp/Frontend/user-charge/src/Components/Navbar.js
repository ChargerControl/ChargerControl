import React, { useState, useEffect } from 'react';
import { 
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Map as MapIcon,
  PowerSettingsNew as PowerIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';


function Navbar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);



  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    handleCloseUserMenu();
    window.location.href = "/login"; // Redirect to login page
    window.dispatchEvent(new Event("storage"));
  };

  const handleNavigation = (path) => {
    window.location.href = path;
    handleCloseUserMenu();
    setMobileOpen(false);
  };

  const pages = [
    { name: 'Charger locations', path: '/charging_locations', icon: <MapIcon /> },
    { name: 'Book Charger', path: '/charging_booking', icon: <PowerIcon /> }
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          ChargerControl
        </Typography>
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem 
            button 
            key={page.name}
            onClick={() => handleNavigation(page.path)}
          >
            <ListItemIcon>{page.icon}</ListItemIcon>
            <ListItemText primary={page.name} />
          </ListItem>
        ))}

        {!isLoggedIn ? (
          <>
            <ListItem button onClick={() => handleNavigation('/login')}>
              <ListItemIcon><AccountIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/register')}>
              <ListItemText primary="Registar" sx={{ pl: 9 }} />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button onClick={() => handleNavigation('/user')}>
              <ListItemIcon><AccountIcon /></ListItemIcon>
              <ListItemText primary="Perfil" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/settings')}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Definições" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  const iconImage = require("../Images/logo.png");

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <img 
            src={iconImage}
            alt="Logo"
            style={{ width: '5%', height: '5%' }}
          />

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              mx: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            ChargerControl
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => handleNavigation(page.path)}
                sx={{ 
                  my: 2, 
                  color: 'text.primary', 
                  display: 'flex', 
                  textTransform: 'none',
                  fontSize: '1rem',
                  mx: 1
                }}
                startIcon={page.icon}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn ? (
              <>
                <Tooltip title="Opções de perfil">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => handleNavigation('/user')}>
                    <ListItemIcon><AccountIcon fontSize="small" /></ListItemIcon>
                    <Typography textAlign="center">Perfil</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/settings')}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    <Typography textAlign="center">Definições</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    <Typography textAlign="center">Sair</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button 
                  onClick={() => handleNavigation('/login')}
                  sx={{ 
                    textTransform: 'none',
                    mr: 1
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => handleNavigation('/register')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Registar
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: 250 
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

export default Navbar;
