import React, { useEffect } from 'react';
import { Dialog, Box, Typography, Zoom } from '@mui/material';
import { Celebration } from '@mui/icons-material';
import { keyframes } from '@mui/system';

const sparkle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const CelebrationPopup = ({ open, onClose, message = "Simply Fountastic!" }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
          overflow: 'visible',
          position: 'relative',
          minWidth: '350px'
        }
      }}
    >
      <Box
        sx={{
          p: 5,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Sparkle effects */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            animation: `${sparkle} 1.5s ease-in-out infinite`
          }}
        >
          <Celebration sx={{ fontSize: 60, color: '#ffd700' }} />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: '#fff',
              fontWeight: 700,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              animation: `${bounce} 1s ease-in-out infinite`,
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '1px'
            }}
          >
            {message}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mt: 2,
              fontWeight: 300
            }}
          >
            Match Verified Successfully! 🎉
          </Typography>
        </Box>

        {/* Confetti effect */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'][i % 5],
              borderRadius: '50%',
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animation: `${sparkle} ${1 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </Box>
    </Dialog>
  );
};

export default CelebrationPopup;
