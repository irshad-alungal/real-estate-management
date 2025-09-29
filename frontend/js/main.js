import { propertiesAPI } from './api.js';

// Display properties on the homepage
async function displayProperties(properties) {
  const container = document.getElementById('propertiesContainer');
  
  if (!container) return;
  
  if (properties.length === 0) {
    container.innerHTML = '<p class="no-properties">No properties found matching your criteria.</p>';
    return;
  }
  
  container.innerHTML = properties.map(property => `
    <div class="property-card">
      <div class="property-image" style="background-image: url('https://via.placeholder.com/400x200?text=${property.title.replace(/\s+/g, '+')}')"></div>
      <div class="property-content">
        <h3 class="property-title">${property.title}</h3>
        <span class="property-type">${property.type}</span>
        <p class="property-description">${property.description}</p>
        <div class="property-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#777"/>
          </svg>
          ${property.location}
        </div>
        <span class="property-status status-${property.status}">${property.status}</span>
      </div>
    </div>
  `).join('');
}

// Filter properties based on user selection
async function filterProperties() {
  const typeFilter = document.getElementById('propertyType').value;
  const statusFilter = document.getElementById('propertyStatus').value;
  const locationFilter = document.getElementById('searchLocation').value.toLowerCase();
  
  try {
    const response = await propertiesAPI.getAll();
    let properties = response.data;
    
    if (typeFilter !== 'all') {
      properties = properties.filter(property => property.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      properties = properties.filter(property => property.status === statusFilter);
    }
    
    if (locationFilter) {
      properties = properties.filter(property => 
        property.location.toLowerCase().includes(locationFilter)
      );
    }
    
    displayProperties(properties);
  } catch (error) {
    console.error('Error filtering properties:', error);
    document.getElementById('propertiesContainer').innerHTML = 
      '<p class="no-properties">Error loading properties. Please try again.</p>';
  }
}

// Initialize the homepage
document.addEventListener('DOMContentLoaded', async function() {
  // Only run on homepage
  if (document.getElementById('propertiesContainer')) {
    try {
      const response = await propertiesAPI.getAll();
      const properties = response.data;
      displayProperties(properties);
      
      // Add event listeners for filters
      document.getElementById('applyFilters').addEventListener('click', filterProperties);
      
      // Also filter when Enter is pressed in location search
      document.getElementById('searchLocation').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          filterProperties();
        }
      });
    } catch (error) {
      console.error('Error loading properties:', error);
      document.getElementById('propertiesContainer').innerHTML = 
        '<p class="no-properties">Error loading properties. Please try again.</p>';
    }
  }
});