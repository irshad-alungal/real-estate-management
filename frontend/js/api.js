const API_BASE_URL = 'http://localhost:3000/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Auth API calls
export const authAPI = {
  login: (loginId, password, userType) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password, userType })
    }),

  logout: () => 
    apiCall('/auth/logout', {
      method: 'POST'
    }),

  check: () => 
    apiCall('/auth/check')
};

// Properties API calls
export const propertiesAPI = {
  getAll: () => 
    apiCall('/properties'),

  getByAdmin: (adminId) => 
    apiCall(`/properties/admin/${adminId}`),

  getById: (propertyId) => 
    apiCall(`/properties/${propertyId}`),

  create: (adminId, propertyData) => 
    apiCall('/properties', {
      method: 'POST',
      body: JSON.stringify({ adminId, propertyData })
    }),

  updateStatus: (propertyId, status) => 
    apiCall(`/properties/${propertyId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

// Purchase Requests API calls
export const purchaseRequestsAPI = {
  getByBroker: (brokerId) => 
    apiCall(`/purchase-requests/broker/${brokerId}`),

  getByAdmin: (adminId) => 
    apiCall(`/purchase-requests/admin/${adminId}`),

  create: (propertyId, user, message) => 
    apiCall('/purchase-requests', {
      method: 'POST',
      body: JSON.stringify({ propertyId, user, message })
    }),

  updateStatus: (requestId, status) => 
    apiCall(`/purchase-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

// Complaints API calls
export const complaintsAPI = {
  getByBroker: (brokerId) => 
    apiCall(`/complaints/broker/${brokerId}`),

  getByAdmin: (adminId) => 
    apiCall(`/complaints/admin/${adminId}`),

  create: (propertyId, userName, userEmail, userPhone, title, description) => 
    apiCall('/complaints', {
      method: 'POST',
      body: JSON.stringify({ propertyId, userName, userEmail, userPhone, title, description })
    }),

  updateStatus: (complaintId, status) => 
    apiCall(`/complaints/${complaintId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

// Admins API calls
export const adminsAPI = {
  getByBroker: (brokerId) => 
    apiCall(`/admins/broker/${brokerId}`),

  create: (brokerId, name, email, loginId, password, role) => 
    apiCall('/admins', {
      method: 'POST',
      body: JSON.stringify({ brokerId, name, email, loginId, password, role })
    })
};