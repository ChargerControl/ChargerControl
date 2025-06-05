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
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Map as MapIcon,
  PowerSettingsNew as PowerIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ElectricCar
} from '@mui/icons-material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';

// Tema personalizado
const theme = createTheme({
  palette: {
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
  },
});

// Componentes estilizados
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(118, 255, 3, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  borderRadius: 20,
  padding: '8px 20px',
  margin: '0 4px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(118, 255, 3, 0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    backgroundColor: 'rgba(118, 255, 3, 0.1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(118, 255, 3, 0.3)',
    '&::before': {
      left: '100%',
    },
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #76ff03 30%, #64dd17 90%)',
  borderRadius: 25,
  padding: '10px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  color: '#1a1a1a',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(118, 255, 3, 0.4)',
  '&:hover': {
    background: 'linear-gradient(45deg, #64dd17 30%, #76ff03 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(118, 255, 3, 0.5)',
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #76ff03, #64dd17)',
  border: '2px solid rgba(118, 255, 3, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 0 20px rgba(118, 255, 3, 0.6)',
    transform: 'scale(1.1)',
  },
}));

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
    window.location.href = "/login";
    window.dispatchEvent(new Event("storage"));
  };

  const handleNavigation = (path) => {
    window.location.href = path;
    handleCloseUserMenu();
    setMobileOpen(false);
  };

  const pages = [
    { name: 'Charger Locations', path: '/charging_locations', icon: <MapIcon /> },
    { name: 'Book Charger', path: '/user?tab=1', icon: <PowerIcon /> }
  ];

  const drawer = (
    <Box 
      onClick={handleDrawerToggle} 
      sx={{ 
        textAlign: 'center', 
        width: 280,
        background: 'linear-gradient(180deg, #1a1a1a 0%, #333333 100%)',
        color: 'white',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 3, borderBottom: '1px solid rgba(118, 255, 3, 0.2)' }}>
        <ElectricCar sx={{ color: '#76ff03', fontSize: 40, mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
          ChargerControl
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {pages.map((page) => (
          <ListItem 
            button 
            key={page.name}
            onClick={() => handleNavigation(page.path)}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(118, 255, 3, 0.1)',
                transform: 'translateX(10px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ListItemIcon sx={{ color: '#76ff03' }}>{page.icon}</ListItemIcon>
            <ListItemText primary={page.name} sx={{ color: 'white' }} />
          </ListItem>
        ))}

        <Divider sx={{ mx: 2, my: 2, backgroundColor: 'rgba(118, 255, 3, 0.2)' }} />

        {!isLoggedIn ? (
          <>
            <ListItem 
              button 
              onClick={() => handleNavigation('/login')}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(118, 255, 3, 0.1)',
                  transform: 'translateX(10px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ListItemIcon sx={{ color: '#76ff03' }}><AccountIcon /></ListItemIcon>
              <ListItemText primary="Login" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleNavigation('/register')}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #76ff03, #64dd17)',
                color: '#1a1a1a',
                '&:hover': {
                  background: 'linear-gradient(45deg, #64dd17, #76ff03)',
                  transform: 'translateX(10px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ListItemText primary="Registar" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              button 
              onClick={() => handleNavigation('/user')}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(118, 255, 3, 0.1)',
                  transform: 'translateX(10px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ListItemIcon sx={{ color: '#76ff03' }}><AccountIcon /></ListItemIcon>
              <ListItemText primary="Perfil" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleNavigation('/settings')}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(118, 255, 3, 0.1)',
                  transform: 'translateX(10px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              
              <ListItemIcon sx={{ color: '#ff5252' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sair" sx={{ color: '#ff5252' }} />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <StyledAppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: '80px' }}>
            {/* Mobile Menu Icon */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(118, 255, 3, 0.1)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo e Nome */}
            <LogoContainer onClick={() => handleNavigation('/')}>
              <ElectricCar 
                sx={{ 
                  color: '#76ff03', 
                  fontSize: 40, 
                  mr: 1,
                  filter: 'drop-shadow(0 0 8px rgba(118, 255, 3, 0.5))'
                }} 
              />
              <Typography
                variant="h5"
                noWrap
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  color: 'white',
                  textDecoration: 'none',
                  background: 'linear-gradient(45deg, #76ff03, #64dd17)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ChargerControl
              </Typography>
            </LogoContainer>

            {/* Menu Desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {pages.map((page) => (
                <StyledButton
                  key={page.name}
                  onClick={() => handleNavigation(page.path)}
                  startIcon={page.icon}
                >
                  {page.name}
                </StyledButton>
              ))}
            </Box>

            {/* Botões de Login/User */}
            <Box sx={{ flexGrow: 0 }}>
              {isLoggedIn ? (
                <>
                  <Tooltip title="Opções de perfil">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Badge 
                        variant="dot" 
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: '#76ff03',
                            boxShadow: '0 0 10px rgba(118, 255, 3, 0.8)',
                          }
                        }}
                      >
                        <StyledAvatar>
                          <AccountIcon />
                        </StyledAvatar>
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ 
                      mt: '45px',
                      '& .MuiPaper-root': {
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
                        border: '1px solid rgba(118, 255, 3, 0.2)',
                        backdropFilter: 'blur(20px)',
                      }
                    }}
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
                    <MenuItem 
                      onClick={() => handleNavigation('/user')}
                      sx={{ 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(118, 255, 3, 0.1)',
                        }
                      }}
                    >
                      <ListItemIcon><AccountIcon fontSize="small" sx={{ color: '#76ff03' }} /></ListItemIcon>
                      <Typography>Perfil</Typography>
                    </MenuItem>
                    <Divider sx={{ backgroundColor: 'rgba(118, 255, 3, 0.2)' }} />
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ 
                        color: '#ff5252',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 82, 82, 0.1)',
                        }
                      }}
                    >
                      <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ff5252' }} /></ListItemIcon>
                      <Typography>Sair</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <StyledButton onClick={() => handleNavigation('/login')}>
                    Login
                  </StyledButton>
                  <GradientButton onClick={() => handleNavigation('/register')}>
                    Registar
                  </GradientButton>
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
              width: 280,
            },
          }}
        >
          {drawer}
        </Drawer>
      </StyledAppBar>
    </ThemeProvider>
  );
}

export default Navbar;