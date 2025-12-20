import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip
} from '@mui/material';
import { getMyReports } from '../services/api';
import { formatDate, getStatusColor, truncateText } from '../utils/helpers';

const MyReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState({ lost: [], found: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getMyReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const currentItems = activeTab === 0 ? reports.lost : reports.found;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track your lost and found item reports
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`Lost Items (${reports.lost.length})`} />
            <Tab label={`Found Items (${reports.found.length})`} />
          </Tabs>
        </Box>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : currentItems.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No reports yet
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {currentItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  {item.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.imageUrl}
                      alt={item.itemName}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom noWrap>
                      {item.itemName}
                    </Typography>
                    <Chip
                      label={item.category}
                      size="small"
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                    <Chip
                      label={item.status}
                      size="small"
                      color={getStatusColor(item.status)}
                      sx={{ ml: 1, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {truncateText(item.description, 80)}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Location: {item.location}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Date: {formatDate(activeTab === 0 ? item.dateLost : item.dateFound)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Reported: {formatDate(item.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default MyReportsPage;
