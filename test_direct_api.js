const jwt = require('jsonwebtoken');

// Create a test token for Ahmed
const testUser = {
  id: 1,
  username: 'ahmed',
  wilaya: 'Setif'
};

const token = jwt.sign(testUser, 'your-secret-key-change-in-production', { expiresIn: '24h' });

console.log('🔧 TESTING DIRECT API CALL');
console.log('===========================');
console.log('Generated test token for Ahmed');
console.log('Token preview:', token.substring(0, 50) + '...');

// Test the API call
async function testAPICall() {
  try {
    const response = await fetch('http://localhost:3001/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📡 API Response:');
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    if (response.ok) {
      const clients = await response.json();
      console.log('✅ Clients received:', clients.length);
      console.log('📋 First client:', clients[0]);
    } else {
      const error = await response.text();
      console.error('❌ API Error:', error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testAPICall();
