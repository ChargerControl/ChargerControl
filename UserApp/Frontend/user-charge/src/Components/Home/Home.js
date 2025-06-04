// Home.jsx
import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Chip,
  Avatar,
  Fade,
  Zoom,
} from '@mui/material';
import { ElectricCar, Login, Map } from '@mui/icons-material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';

// Tema personalizado harmonizado com a navbar
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
    background: {
      default: '#0a0a0a',
    },
  },
  typography: {
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
  },
});

// Componentes estilizados
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, #000000 0%, #1a1a1a 30%, #2a2a2a 70%, #1a1a1a 100%)`,
  display: 'flex',
  alignItems: 'flex-start',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(25),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(15),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at center, rgba(118, 255, 3, 0.1) 0%, transparent 70%)',
    zIndex: 1,
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #76ff03 30%, #64dd17 90%)',
  color: '#000000',
  borderRadius: 25,
  padding: '14px 32px',
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 25px rgba(118, 255, 3, 0.4)',
  border: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #64dd17 30%, #76ff03 90%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(118, 255, 3, 0.6)',
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderColor: '#76ff03',
  color: '#76ff03',
  borderRadius: 25,
  padding: '14px 32px',  
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  borderWidth: 2,
  transition: 'all 0.3s ease',
  background: 'rgba(26, 26, 26, 0.8)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: 'rgba(118, 255, 3, 0.1)',
    borderColor: '#76ff03',
    borderWidth: 2,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(118, 255, 3, 0.3)',
  },
}));

function Home() {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const handleMapClick = () => {
    window.location.href = '/charging_locations';
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', overflow: 'hidden' }}>
        <HeroSection>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'center', md: 'flex-start' },
                justifyContent: 'center',
                height: '100%',
                textAlign: { xs: 'center', md: 'left' },
                pt: { xs: 2, md: 6 },
              }}
            >
              <Grid
                container
                spacing={{ xs: 4, md: 8 }}
                alignItems="flex-start"
                justifyContent="center"
                sx={{ maxWidth: '1400px', mt: { xs: 2, md: 4 } }}
              >
                <Grid item xs={12} md={7}>
                  <Fade in={checked} timeout={1000}>
                    <Box sx={{ maxWidth: { xs: '100%', md: '700px' } }}>
                      <Chip
                        label="⚡ The Future of Mobility"
                        sx={{
                          mb: 3,
                          backgroundColor: 'rgba(118, 255, 3, 0.15)',
                          color: '#76ff03',
                          fontSize: '1.3rem',
                          px: 4,
                          py: 1.5,
                          borderRadius: 50,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(118, 255, 3, 0.3)',
                          boxShadow: '0 4px 15px rgba(118, 255, 3, 0.2)',
                        }}
                      />
                      <Typography
                        variant="h1"
                        sx={{
                          color: 'white',
                          mb: 3,
                          textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                          fontSize: { xs: '3rem', md: '4.5rem' },
                          fontWeight: 800,
                          lineHeight: 1.1,
                        }}
                      >
                        Charge Your
                        <Box
                          component="span"
                          sx={{
                            background: 'linear-gradient(45deg, #76ff03, #b2ff59)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                            display: 'block',
                            mt: 1,
                            filter: 'drop-shadow(0 0 15px rgba(118, 255, 3, 0.8))',
                          }}
                        >
                          Electric Future
                        </Box>
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'rgba(255,255,255,0.85)',
                          mb: 4,
                          lineHeight: 1.6,
                          fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                          fontWeight: 400,
                          maxWidth: '600px',
                        }}
                      >
                        Find, book, and charge your electric vehicle at the best stations.
                        Simple, fast, and sustainable.
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          flexWrap: 'wrap',
                        }}
                      >
                        <NeonButton
                          size="large"
                          startIcon={<Map />}
                          onClick={handleMapClick}
                          sx={{
                            minWidth: '220px',
                            py: 2.5,
                            fontSize: '1.2rem',
                          }}
                        >
                          Explore Map
                        </NeonButton>
                        <OutlineButton
                          variant="outlined"
                          size="large"
                          startIcon={<Login />}
                          onClick={handleLoginClick}
                          sx={{
                            minWidth: '170px',
                            py: 2.5,
                            fontSize: '1.2rem',
                          }}
                        >
                          Login
                        </OutlineButton>
                      </Box>
                    </Box>
                  </Fade>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Zoom in={checked} timeout={1500}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: { xs: 'center', md: 'flex-start' },
                        height: 'auto',
                        mt: { xs: 4, md: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -25,
                            left: -25,
                            right: -25,
                            bottom: -25,
                            background: 'radial-gradient(circle, rgba(118, 255, 3, 0.3) 0%, transparent 70%)',
                            borderRadius: '50%',
                            zIndex: -1,
                            animation: 'pulse 2s ease-in-out infinite alternate',
                          },
                          '@keyframes pulse': {
                            '0%': {
                              transform: 'scale(1)',
                              opacity: 0.7,
                            },
                            '100%': {
                              transform: 'scale(1.1)',
                              opacity: 0.3,
                            },
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: { xs: 200, sm: 250, md: 350 },
                            height: { xs: 200, sm: 250, md: 350 },
                            background:
                              'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(51, 51, 51, 0.7) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(118, 255, 3, 0.4)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(118, 255, 3, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05) rotate(5deg)',
                              boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(118, 255, 3, 0.4)',
                              border: '2px solid rgba(118, 255, 3, 0.6)',
                            },
                          }}
                        >
                          <ElectricCar
                            sx={{
                              fontSize: { xs: 120, sm: 150, md: 170 },
                              color: '#76ff03',
                              filter: 'drop-shadow(0 4px 15px rgba(118, 255, 3, 0.5))',
                            }}
                          />
                        </Avatar>
                      </Box>
                    </Box>
                  </Zoom>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </HeroSection>
      </Box>
    </ThemeProvider>
  );
}

export default Home;