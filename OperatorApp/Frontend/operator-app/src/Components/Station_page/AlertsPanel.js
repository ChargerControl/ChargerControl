// AlertsPanel.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Warning,
  Refresh,
  CheckCircle,
  Error
} from '@mui/icons-material';

const AlertsPanel = ({ alerts }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <CheckCircle color="info" />;
      default: return <CheckCircle color="info" />;
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            Alertas e Notificações
          </Typography>
          <IconButton>
            <Refresh />
          </IconButton>
        </Box>
        <List>
          {alerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              <ListItem>
                <ListItemIcon>
                  {getAlertIcon(alert.type)}
                </ListItemIcon>
                <ListItemText 
                  primary={alert.message}
                  secondary={`Às ${alert.time}`}
                />
              </ListItem>
              {index < alerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;