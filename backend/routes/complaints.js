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

// Get all complaints for broker
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

    let allComplaints = [];

    broker.admins.forEach(admin => {
      admin.properties.forEach(property => {
        property.complaints.forEach(complaint => {
          allComplaints.push({
            ...complaint,
            propertyTitle: property.title,
            propertyId: property.propertyId,
            adminName: admin.name
          });
        });
      });
    });

    res.json({
      success: true,
      data: allComplaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
});

// Get complaints by admin
router.get('/admin/:adminId', (req, res) => {
  try {
    const { adminId } = req.params;
    const data = readData();

    let adminComplaints = [];

    for (const broker of data.brokers) {
      const admin = broker.admins.find(a => a.adminId === adminId);
      if (admin) {
        admin.properties.forEach(property => {
          property.complaints.forEach(complaint => {
            adminComplaints.push({
              ...complaint,
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
      data: adminComplaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin complaints'
    });
  }
});

// Create complaint
router.post('/', (req, res) => {
  try {
    const { propertyId, userName, userEmail, userPhone, title, description } = req.body;
    const data = readData();

    let propertyFound = null;

    for (const broker of data.brokers) {
      for (const admin of broker.admins) {
        const propertyIndex = admin.properties.findIndex(p => p.propertyId === propertyId);
        if (propertyIndex !== -1) {
          propertyFound = admin.properties[propertyIndex];
          
          const newComplaint = {
            complaintId: `c_${uuidv4()}`,
            userId: `u_${uuidv4()}`,
            userName,
            userEmail,
            userPhone,
            title,
            description,
            status: 'open',
            createdAt: new Date().toISOString()
          };

          admin.properties[propertyIndex].complaints.push(newComplaint);
          break;
        }
      }
      if (propertyFound) break;
    }

    if (propertyFound) {
      writeData(data);
      res.json({
        success: true,
        message: 'Complaint submitted successfully'
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
      message: 'Error submitting complaint'
    });
  }
});

// Update complaint status
router.patch('/:complaintId/status', (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;
    const data = readData();

    let complaintFound = false;

    for (const broker of data.brokers) {
      for (const admin of broker.admins) {
        for (const property of admin.properties) {
          const complaintIndex = property.complaints.findIndex(c => c.complaintId === complaintId);
          if (complaintIndex !== -1) {
            property.complaints[complaintIndex].status = status;
            complaintFound = true;
            break;
          }
        }
        if (complaintFound) break;
      }
      if (complaintFound) break;
    }

    if (complaintFound) {
      writeData(data);
      res.json({
        success: true,
        message: 'Complaint status updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status'
    });
  }
});

module.exports = router;