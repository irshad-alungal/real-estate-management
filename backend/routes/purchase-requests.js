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

// Get all purchase requests for broker
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

    let allRequests = [];

    broker.admins.forEach(admin => {
      admin.properties.forEach(property => {
        property.purchaseRequests.forEach(request => {
          allRequests.push({
            ...request,
            propertyTitle: property.title,
            propertyId: property.propertyId,
            adminName: admin.name
          });
        });
      });
    });

    res.json({
      success: true,
      data: allRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase requests'
    });
  }
});

// Get purchase requests by admin
router.get('/admin/:adminId', (req, res) => {
  try {
    const { adminId } = req.params;
    const data = readData();

    let adminRequests = [];

    for (const broker of data.brokers) {
      const admin = broker.admins.find(a => a.adminId === adminId);
      if (admin) {
        admin.properties.forEach(property => {
          property.purchaseRequests.forEach(request => {
            adminRequests.push({
              ...request,
              propertyTitle: property.title,
              propertyId: property.propertyId
            });
          });
        });
        break;
      }
    }

    res.json({
      success: true,
      data: adminRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin purchase requests'
    });
  }
});

// Create purchase request
router.post('/', (req, res) => {
  try {
    const { propertyId, user, message } = req.body;
    const data = readData();

    let propertyFound = null;

    for (const broker of data.brokers) {
      for (const admin of broker.admins) {
        const propertyIndex = admin.properties.findIndex(p => p.propertyId === propertyId);
        if (propertyIndex !== -1) {
          propertyFound = admin.properties[propertyIndex];
          
          const newRequest = {
            requestId: `req_${uuidv4()}`,
            user: {
              userId: `u_${uuidv4()}`,
              ...user
            },
            message: message || 'Interested in purchasing this property.',
            status: 'pending',
            requestDate: new Date().toISOString()
          };

          admin.properties[propertyIndex].purchaseRequests.push(newRequest);
          break;
        }
      }
      if (propertyFound) break;
    }

    if (propertyFound) {
      writeData(data);
      res.json({
        success: true,
        message: 'Purchase request submitted successfully'
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
      message: 'Error submitting purchase request'
    });
  }
});

// Update purchase request status
router.patch('/:requestId/status', (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const data = readData();

    let requestFound = false;

    for (const broker of data.brokers) {
      for (const admin of broker.admins) {
        for (const property of admin.properties) {
          const requestIndex = property.purchaseRequests.findIndex(r => r.requestId === requestId);
          if (requestIndex !== -1) {
            property.purchaseRequests[requestIndex].status = status;
            requestFound = true;
            break;
          }
        }
        if (requestFound) break;
      }
      if (requestFound) break;
    }

    if (requestFound) {
      writeData(data);
      res.json({
        success: true,
        message: 'Purchase request status updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Purchase request not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating purchase request status'
    });
  }
});

module.exports = router;