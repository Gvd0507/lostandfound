import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getLostItems, getFoundItems } from '../services/api';
import { formatDate, getStatusColor, truncateText } from '../utils/helpers';

const BrowsePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Electronics',
    'Books & Stationery',
    'Clothing',
    'Accessories',
    'ID Cards & Documents',
    'Keys',
    'Bags & Backpacks',
    'Jewelry',
    'Sports Equipment',
    'Other'
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [activeTab, lostItems, foundItems, searchTerm, categoryFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [lost, found] = await Promise.all([
        getLostItems(),
        getFoundItems()
      ]);
      setLostItems(lost);
      setFoundItems(found);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    const items = activeTab === 0 ? lostItems : foundItems;
    
    let filtered = items.filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    setFilteredItems(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Browse Items
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`Lost Items (${lostItems.length})`} />
            <Tab label={`Found Items (${foundItems.length})`} />
          </Tabs>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : filteredItems.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No items found
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
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

export default BrowsePage;
