import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, InputAdornment, Paper, Link, Container
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await fetch("http://192.168.160.7:8081/apiV1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed. Please try again.");
      }

      const data = await response.json();
      
      // Handle successful registration
      // Redirect to login or automatically log in the user
      window.location.href = "/login"; // Redirect to login page after successful registration
      
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
    }
  };

  const registerImage = require("../../Images/Register.png"); 

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
          src={registerImage}
          alt="Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'translateY(50px)'
          }}
        />
      </Box>

      {/* Registration Form Card */}
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
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom mb={3}>
          Sign up to start managing your charging
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
            label="Full Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((show) => !show)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Create Account
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link href="/login" underline="hover" fontWeight="medium">
              Log In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;