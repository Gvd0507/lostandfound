import React from 'react';
import { Box, Paper, Typography, IconButton, Slide } from '@mui/material';
import { Close as CloseIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';

const NotificationPopup = () => {
  const { latestNotification, showPopup, setShowPopup } = useNotifications();

  if (!showPopup || !latestNotification) {
    return null;
  }

  return (
    <Slide direction="left" in={showPopup} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: 80,
          right: 20,
          width: 350,
          maxWidth: '90vw',
          p: 2,
          zIndex: 9999,
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 40, color: 'success.light', mt: 0.5 }} />
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {latestNotification.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              {latestNotification.message}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={() => setShowPopup(false)}
            sx={{ color: 'white', mt: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
};

export default NotificationPopup;
