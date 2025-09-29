const express = require('express');
const fs = require('fs');
const path = require('path');
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

// Get all properties
router.get('/', (req, res) => {
  try {
    const data = readData();
    let properties = [];

    data.brokers.forEach(broker => {
      broker.admins.forEach(admin => {
        properties = properties.concat(admin.properties);
      });
    });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching properties'
    });
  }
});

// Get properties by admin
router.get('/admin/:adminId', (req, res) => {
  try {
    const { adminId } = req.params;
    const data = readData();

    let adminProperties = [];

    for (const broker of data.brokers) {
      const admin = broker.admins.find(a => a.adminId === adminId);
      if (admin) {
        adminProperties = admin.properties;
        break;
      }
    }

    res.json({
      success: true,
      data: adminProperties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin properties'
    });
  }
});

// Get single property
router.get('/:propertyId', (req, res) => {
  try {
    const { propertyId } = req.params;
    const data = readData();

    let property = null;

    for (const broker of data.brokers) {
      for (const admin of broker.admins) {
        const foundProperty = admin.properties.find(p => p.propertyId === propertyId);
        if (foundProperty) {
          property = foundProperty;
          break;
        }
      }
      if (property) break;
    }

    if (property) {
      res.json({
        success: true,
        data: property
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching property'
    });
  }
});

// Add new property
router.post('/', (req, res) => {
  try {
    const { adminId, propertyData } = req.body;
    const data = readData();

    let adminFound = null;
    let brokerFound = null;

    for (const broker of data.brokers) {
      const admin = broker.admins.find(a => a.adminId === adminId);
      if (admin) {
        adminFound = admin;
        brokerFound = broker;
        break;
      }
    }

    if (!adminFound) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const newProperty = {
      propertyId: `prop_${uuidv4()}`,
      ...propertyData,
      listedAt: new Date().toISOString(),
      purchaseRequests: [],
      complaints: []
    };

    adminFound.properties.push(newProperty);
    writeData(data);

    res.json({
      success: true,
      data: newProperty,
      message: 'Property added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding property'
    });
  }
});

// Update property status
router.patch('/:propertyId/status', (req, res) => {
  try {
    const { propertyId } = req.params;
    const { status } = req.body;
    const data = readData();

    let propertyFound = null;

    for (const broker of data.brokers) {
      for (const admin of broker.admins) {
        const propertyIndex = admin.properties.findIndex(p => p.propertyId === propertyId);
        if (propertyIndex !== -1) {
          admin.properties[propertyIndex].status = status;
          propertyFound = admin.properties[propertyIndex];
          break;
        }
      }
      if (propertyFound) break;
    }

    if (propertyFound) {
      writeData(data);
      res.json({
        success: true,
        data: propertyFound,
        message: 'Property status updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating property status'
    });
  }
});

module.exports = router;