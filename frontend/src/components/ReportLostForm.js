import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { reportLostItem } from '../services/api';
import { isValidImageFile, isValidFileSize } from '../utils/helpers';

const categories = [
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

const ReportLostForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    location: '',
    dateLost: '',
    timeLost: '',
    secretQuestion: '',
    secretAnswer: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isValidImageFile(file)) {
        setError('Please upload a valid image file (JPEG, PNG, WebP)');
        return;
      }
      if (!isValidFileSize(file)) {
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = new FormData();
      data.append('itemName', formData.itemName);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('dateLost', formData.dateLost);
      data.append('timeLost', formData.timeLost);
      data.append('secretQuestion', formData.secretQuestion);
      data.append('secretAnswer', formData.secretAnswer);
      if (image) {
        data.append('image', image);
      }

      await reportLostItem(data);
      
      // Reset form
      setFormData({
        itemName: '',
        category: '',
        description: '',
        location: '',
        dateLost: '',
        timeLost: '',
        secretQuestion: '',
        secretAnswer: ''
      });
      setImage(null);
      setImagePreview(null);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report lost item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Report Lost Item
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Item Name"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              placeholder="e.g., Blue Laptop Bag"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="Date Lost"
              name="dateLost"
              value={formData.dateLost}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Time Lost (Optional)"
              name="timeLost"
              value={formData.timeLost}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Library 3rd Floor"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the item in detail (color, brand, unique features, etc.)"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imagePreview && (
              <Box mt={2} textAlign="center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Security Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Set a secret question only you can answer to verify ownership
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Secret Question"
              name="secretQuestion"
              value={formData.secretQuestion}
              onChange={handleChange}
              placeholder="e.g., What is written on the sticker? What's inside the bag?"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              type="password"
              label="Secret Answer"
              name="secretAnswer"
              value={formData.secretAnswer}
              onChange={handleChange}
              placeholder="Enter the answer to your secret question"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
            >
              {loading ? 'Submitting...' : 'Report Lost Item'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ReportLostForm;
