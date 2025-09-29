const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/database.json');

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { loginId, password, userType } = req.body;
    const data = readData();

    console.log('Login attempt:', { loginId, userType }); // Debug log

    if (userType === 'broker') {
      const broker = data.brokers.find(b => b.loginId === loginId);
      console.log('Broker found:', broker ? 'Yes' : 'No'); // Debug log
      
      if (broker && broker.password === password) {
        res.json({
          success: true,
          user: {
            id: broker.brokerId,
            name: broker.name,
            type: 'broker'
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid broker credentials'
        });
      }
    } else if (userType === 'admin') {
      let adminFound = null;
      let brokerFound = null;

      for (const broker of data.brokers) {
        const admin = broker.admins.find(a => a.loginId === loginId);
        if (admin) {
          console.log('Admin found:', admin.name); // Debug log
          if (admin.password === password) {
            adminFound = admin;
            brokerFound = broker;
            break;
          }
        }
      }

      if (adminFound && brokerFound) {
        res.json({
          success: true,
          user: {
            id: adminFound.adminId,
            name: adminFound.name,
            type: 'admin',
            brokerId: brokerFound.brokerId
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Check auth status
router.get('/check', (req, res) => {
  res.json({
    success: true,
    message: 'Auth check endpoint'
  });
});

module.exports = router;