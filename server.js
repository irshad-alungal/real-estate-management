const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./backend/routes/auth');
const propertyRoutes = require('./backend/routes/properties');
const purchaseRequestRoutes = require('./backend/routes/purchase-requests');
const complaintRoutes = require('./backend/routes/complaints');
const adminRoutes = require('./backend/routes/admins');

const app = express();

// Use environment variable or default to 3000
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admins', adminRoutes);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API Home
app.get('/api', (req, res) => {
  res.json({
    message: 'Real Estate Management System API',
    environment: NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      purchaseRequests: '/api/purchase-requests',
      complaints: '/api/complaints',
      admins: '/api/admins'
    }
  });
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`📊 API available at: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend available at: http://localhost:${PORT}`);
});