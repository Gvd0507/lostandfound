import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CardMedia,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { AdminPanelSettings, CheckCircle, Cancel } from '@mui/icons-material';
import { getAdminCases, resolveAdminCase } from '../services/api';

const AdminDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [resolution, setResolution] = useState('');
  const [matchVerified, setMatchVerified] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getAdminCases();
      setCases(data);
    } catch (error) {
      console.error('Error fetching admin cases:', error);
      setError('Failed to load admin cases');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveCase = async () => {
    if (!resolution.trim()) {
      setError('Please provide a resolution');
      return;
    }

    try {
      await resolveAdminCase(selectedCase.id, {
        resolution,
        matchVerified
      });
      setSuccess('Case resolved successfully!');
      setSelectedCase(null);
      setResolution('');
      setMatchVerified(false);
      fetchCases();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resolve case');
    }
  };

  const handleClose = () => {
    setSelectedCase(null);
    setResolution('');
    setMatchVerified(false);
    setError(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Review and resolve verification cases that exceeded the maximum attempts
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {cases.length === 0 ? (
          <Alert severity="info">
            No pending admin cases. All verification attempts are within limits!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {cases.map((adminCase) => (
              <Grid item xs={12} key={adminCase.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Case #{adminCase.id}
                      </Typography>
                      <Chip
                        label={`Match Score: ${(adminCase.match_score * 100).toFixed(0)}%`}
                        color="primary"
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Reason:</strong> {adminCase.reason}
                    </Typography>

                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                      Created: {new Date(adminCase.created_at).toLocaleString()}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Lost Item:
                        </Typography>
                        {adminCase.lost_image_url && (
                          <CardMedia
                            component="img"
                            height="150"
                            image={adminCase.lost_image_url}
                            alt={adminCase.lost_item_name}
                            sx={{ borderRadius: 1, mb: 1, objectFit: 'cover' }}
                          />
                        )}
                        <Typography variant="body1" fontWeight="bold">
                          {adminCase.lost_item_name}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Found Item:
                        </Typography>
                        {adminCase.found_image_url && (
                          <CardMedia
                            component="img"
                            height="150"
                            image={adminCase.found_image_url}
                            alt={adminCase.found_item_name}
                            sx={{ borderRadius: 1, mb: 1, objectFit: 'cover' }}
                          />
                        )}
                        <Typography variant="body1" fontWeight="bold">
                          {adminCase.found_item_name}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          setSelectedCase(adminCase);
                          setMatchVerified(true);
                        }}
                      >
                        Approve Match
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setSelectedCase(adminCase);
                          setMatchVerified(false);
                        }}
                      >
                        Reject Match
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Resolution Dialog */}
      <Dialog open={Boolean(selectedCase)} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {matchVerified ? 'Approve Match' : 'Reject Match'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body2" paragraph>
            Case #{selectedCase?.id}
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={matchVerified}
                onChange={(e) => setMatchVerified(e.target.checked)}
              />
            }
            label="Verify this match as legitimate"
          />

          <TextField
            fullWidth
            label="Resolution Notes"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            multiline
            rows={4}
            placeholder="Explain your decision..."
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleResolveCase}
            variant="contained"
            color={matchVerified ? 'success' : 'error'}
          >
            {matchVerified ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
