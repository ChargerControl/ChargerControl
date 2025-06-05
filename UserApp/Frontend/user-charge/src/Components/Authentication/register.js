import React, { useState } from 'react';
import {
Box, Button, TextField, Typography, IconButton, InputAdornment, Paper, Container
} from '@mui/material';
import { Visibility, VisibilityOff, ElectricCar } from '@mui/icons-material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';

// Tema personalizado (mesmo da navbar)
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

// Componente estilizado para o TextField
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(118, 255, 3, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(118, 255, 3, 0.6)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#76ff03',
      boxShadow: '0 0 15px rgba(118, 255, 3, 0.3)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#76ff03',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'white',
  },
}));

// Botão com gradiente
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #76ff03 30%, #64dd17 90%)',
  borderRadius: 25,
  padding: '12px 24px',
  fontSize: '1.1rem',
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

// Container do logo
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
}));

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await fetch("http://192.168.160.7:8080/apiV1/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed. Please try again.");
      }

      const data = await response.json();
      console.log("Registration successful:", data);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("jwt", data.jwt);
      window.dispatchEvent(new Event("storage"));
      window.location.href = "/";
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: 'calc(100vh - 129px)', // Ajustado para considerar a altura da navbar
          background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4, // Padding vertical para espaçamento
        }}
      >
        <Container maxWidth="sm" sx={{ px: 2 }}>
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(51, 51, 51, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(118, 255, 3, 0.2)',
              borderRadius: '20px',
              padding: { xs: 2.5, sm: 3.5 },
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent, rgba(118, 255, 3, 0.03), transparent)',
                pointerEvents: 'none',
              },
            }}
          >
            {/* Logo e Título */}
            <LogoContainer sx={{ mb: 1.5 }}>
              <ElectricCar
                sx={{
                  color: '#76ff03',
                  fontSize: 40,
                  mr: 1.5,
                  filter: 'drop-shadow(0 0 12px rgba(118, 255, 3, 0.6))'
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #76ff03, #64dd17)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ChargerControl
              </Typography>
            </LogoContainer>

            <Typography
              variant="h6"
              sx={{
                color: 'white',
                textAlign: 'center',
                mb: 0.5,
                fontWeight: 600
              }}
            >
              Create Account
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                mb: 3
              }}
            >
              Sign up to start managing your charging
            </Typography>

            {error && (
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 82, 82, 0.1)',
                  border: '1px solid rgba(255, 82, 82, 0.3)',
                  color: '#ff5252',
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Paper>
            )}

            <form onSubmit={handleSubmit}>
              <StyledTextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                sx={{ mb: 2 }}
              />

              <StyledTextField
                label="Email Address"
                variant="outlined"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              <StyledTextField
                label="Password"
                variant="outlined"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((show) => !show)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                label="Confirm Password"
                variant="outlined"
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 2.5 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((show) => !show)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <GradientButton
                type="submit"
                fullWidth
                size="large"
                sx={{ mb: 3 }}
              >
                Create Account
              </GradientButton>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Already have an account?{' '}
                <Typography
                  component="a"
                  href="/login"
                  sx={{
                    color: '#76ff03',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#64dd17',
                    }
                  }}
                >
                  Log In
                </Typography>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Register;