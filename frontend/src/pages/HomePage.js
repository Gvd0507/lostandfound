import React from 'react';
import { Container, Typography, Box, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  AddCircleOutline,
  CheckCircle
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Welcome to Campus Lost & Found
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          AI-powered system to reunite you with your lost items
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-8px)', transition: '0.3s' }
              }}
              onClick={() => navigate('/browse')}
            >
              <SearchOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Browse Items
              </Typography>
              <Typography color="text.secondary">
                Search through lost and found items reported by others
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-8px)', transition: '0.3s' }
              }}
              onClick={() => navigate('/report')}
            >
              <AddCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Report Item
              </Typography>
              <Typography color="text.secondary">
                Report a lost or found item with photos and details
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-8px)', transition: '0.3s' }
              }}
              onClick={() => navigate('/matches')}
            >
              <CheckCircle sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                My Matches
              </Typography>
              <Typography color="text.secondary">
                View potential matches and verify ownership
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/report')}
            sx={{ mr: 2 }}
          >
            Report Lost Item
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/report')}
          >
            Report Found Item
          </Button>
        </Box>

        <Paper sx={{ mt: 6, p: 4, bgcolor: 'background.default' }}>
          <Typography variant="h5" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" color="primary" gutterBottom>
                1. Report
              </Typography>
              <Typography variant="body2">
                Upload photos and describe your lost or found item
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" color="primary" gutterBottom>
                2. AI Matching
              </Typography>
              <Typography variant="body2">
                Our AI analyzes images and descriptions to find matches
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" color="primary" gutterBottom>
                3. Verification
              </Typography>
              <Typography variant="body2">
                Answer secret questions to verify ownership
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" color="primary" gutterBottom>
                4. Reunite
              </Typography>
              <Typography variant="body2">
                Get notified and arrange to collect your item
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;
