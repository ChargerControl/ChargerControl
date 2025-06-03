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

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
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
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'flex-start',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(25),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(15),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.light} 90%)`,
  borderRadius: 25,
  padding: '14px 32px',
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)',
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.main} 90%)`,
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 25px rgba(76, 175, 80, 0.4)',
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
                        label="🚗 The Future of Mobility"
                        sx={{
                          mb: 3,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          fontSize: '1.3rem',
                          px: 4,
                          py: 1.5,
                          borderRadius: 50,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      />
                      <Typography
                        variant="h1"
                        sx={{
                          color: 'white',
                          mb: 3,
                          textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                          fontSize: { xs: '3rem', md: '4.5rem' },
                          fontWeight: 800,
                          lineHeight: 1.1,
                        }}
                      >
                        Charge Your
                        <Box
                          component="span"
                          sx={{
                            background: 'linear-gradient(45deg, #4caf50, #81c784)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                            display: 'block',
                            mt: 1,
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
                        <GradientButton
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
                        </GradientButton>
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<Login />}
                          onClick={handleLoginClick}
                          sx={{
                            borderColor: 'rgba(255,255,255,0.8)',
                            color: 'white',
                            borderRadius: 25,
                            px: 5,
                            py: 2.5,
                            minWidth: '170px',
                            borderWidth: 2,
                            fontWeight: 600,
                            fontSize: '1.2rem',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              borderColor: 'white',
                              borderWidth: 2,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          Login
                        </Button>
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
                            background: 'radial-gradient(circle, rgba(76,175,80,0.3) 0%, transparent 70%)',
                            borderRadius: '50%',
                            zIndex: -1,
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: { xs: 200, sm: 250, md: 350 },
                            height: { xs: 200, sm: 250, md: 350 },
                            background:
                              'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05) rotate(5deg)',
                              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                            },
                          }}
                        >
                          <ElectricCar
                            sx={{
                              fontSize: { xs: 120, sm: 150, md: 170 },
                              color: 'white',
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
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
