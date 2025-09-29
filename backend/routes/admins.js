const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

// Get all admins for broker
router.get('/broker/:brokerId', (req, res) => {
  try {
    const { brokerId } = req.params;
    const data = readData();

    const broker = data.brokers.find(b => b.brokerId === brokerId);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    res.json({
      success: true,
      data: broker.admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admins'
    });
  }
});

// Create new admin
router.post('/', async (req, res) => {
  try {
    const { brokerId, name, email, loginId, password, role } = req.body;
    const data = readData();

    const broker = data.brokers.find(b => b.brokerId === brokerId);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    // Check if loginId already exists
    const existingAdmin = broker.admins.find(a => a.loginId === loginId);
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Login ID already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = {
      adminId: `adm_${uuidv4()}`,
      name,
      email,
      loginId,
      password: hashedPassword,
      role: role || 'manager',
      createdAt: new Date().toISOString(),
      properties: []
    };

    broker.admins.push(newAdmin);
    writeData(data);

    // Don't send password back
    const { password: _, ...adminWithoutPassword } = newAdmin;

    res.json({
      success: true,
      data: adminWithoutPassword,
      message: 'Admin created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin'
    });
  }
});

module.exports = router;