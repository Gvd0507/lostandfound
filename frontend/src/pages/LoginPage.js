import React from 'react';
import { Box, Button, Container, Typography, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      await login();
      navigate('/');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
            LoFo
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Find your lost items with AI-powered matching
          </Typography>

          {(error || loginError) && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error || loginError}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <Typography variant="caption" align="center" display="block" color="text.secondary">
            Only @student.gitam.edu and @gitam.in emails are allowed
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              How it works:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2">
                  📸 <strong>Report Lost:</strong> Upload image, describe your item, set a secret question
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  🔍 <strong>Report Found:</strong> Upload image, describe the item you found
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  🤖 <strong>AI Matching:</strong> Our system automatically matches items
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  ✅ <strong>Verification:</strong> Answer secret questions to confirm ownership
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
