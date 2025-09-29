const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const purchaseRequestRoutes = require('./routes/purchase-requests');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admins');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admins', adminRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Home
app.get('/api', (req, res) => {
  res.json({
    message: 'Real Estate Management System API',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      purchaseRequests: '/api/purchase-requests',
      complaints: '/api/complaints',
      admins: '/api/admins'
    }
  });
});

// Serve frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});