import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Alert } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import ReportLostForm from '../components/ReportLostForm';
import ReportFoundForm from '../components/ReportFoundForm';

const ReportPage = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'found' ? 1 : 0);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Update tab when query parameter changes
    if (tabParam === 'found') {
      setActiveTab(1);
    } else if (tabParam === 'lost') {
      setActiveTab(0);
    }
  }, [tabParam]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSuccess(null);
  };

  const handleSuccess = () => {
    setSuccess(activeTab === 0 ? 'Lost item reported successfully! Our AI will search for matches.' : 'Found item reported successfully! We will notify you if we find a match.');
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Report an Item
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Help us reunite items with their owners
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Lost Item" />
            <Tab label="Found Item" />
          </Tabs>
        </Box>

        {activeTab === 0 && <ReportLostForm onSuccess={handleSuccess} />}
        {activeTab === 1 && <ReportFoundForm onSuccess={handleSuccess} />}
      </Box>
    </Container>
  );
};

export default ReportPage;
