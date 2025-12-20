require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const config = require('./config');

// Import routes
const lostItemsRoutes = require('./routes/lostItems');
const foundItemsRoutes = require('./routes/foundItems');
const matchesRoutes = require('./routes/matches');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: require('os').tmpdir(), // Cross-platform temp directory
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  createParentPath: true,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API routes
app.use('/api/lost-items', lostItemsRoutes);
app.use('/api/found-items', foundItemsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
    🚀 Server is running on port ${PORT}
    📍 API URL: http://localhost:${PORT}
    🌍 Environment: ${config.env}
  `);
  
  // Load AI model at startup
  const { loadModel } = require('./services/imageAnalysis');
  loadModel().catch(err => {
    console.error('Failed to load AI model:', err);
  });
});

module.exports = app;
