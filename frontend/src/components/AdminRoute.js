import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography variant="h5" align="center" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          You need administrator privileges to access this page.
        </Typography>
      </Container>
    );
  }

  return children;
};

export default AdminRoute;
