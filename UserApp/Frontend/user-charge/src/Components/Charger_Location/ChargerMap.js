import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, InputAdornment, Paper, Link, Container
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Map() {

  const loginImage = require("../../Images/Map.png");
//por a cena de se n estiver logado tem de se logar
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
      
    </Box>
  );
}

export default Map;