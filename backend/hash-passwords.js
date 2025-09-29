const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, './data/database.json');

async function hashPasswords() {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    
    // Hash broker password
    data.brokers[0].password = await bcrypt.hash('Broker@123', 10);
    
    // Hash admin passwords
    data.brokers[0].admins[0].password = await bcrypt.hash('John@12345', 10);
    data.brokers[0].admins[1].password = await bcrypt.hash('Sarah@6789', 10);
    
    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Passwords hashed successfully!');
  } catch (error) {
    console.error('Error hashing passwords:', error);
  }
}

hashPasswords();