import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, InputAdornment, Paper, Link, Container
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSetEmail = (value) => {
    localStorage.setItem("userEmail", value || "");
    const parts = value.split("@");
    localStorage.setItem("userName", parts[0] || "");
    setEmail(value);
  };

  const handleSetPassword = (value) => setPassword(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://192.168.160.7:8081/apiV1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials. Please try again.");

      const data = await response.json();

      if (data.jwt) {
        localStorage.setItem("authToken", data.jwt);
        localStorage.setItem("isLoggedIn", "true");
        window.dispatchEvent(new Event("storage"));
      } else {
        throw new Error("Token not found in the API response.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };

  const loginImage = require("../../Images/Login.png");

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better contrast
            zIndex: 1,
          },
        }}
      >
        <img
          src={loginImage}
          alt="Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Login Form Card */}
      <Paper
        elevation={24}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: { xs: '90%', sm: '450px' },
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome back!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom mb={3}>
          Enter your credentials to access your account
        </Typography>

        {error && (
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: 'error.light', 
              color: 'error.main', 
              p: 2, 
              mb: 3,
              borderRadius: 1 
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => handleSetEmail(e.target.value)}
            required
            autoFocus
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handleSetPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Link href="#" variant="body2" underline="hover">
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              mt: 1, 
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Login
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link href="/register" underline="hover" fontWeight="medium">
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;