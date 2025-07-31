console.log('🔧 DEBUGGING CLIENT SELECTION ISSUE');
console.log('===================================');

// Test what's in localStorage
console.log('📝 localStorage Contents:');
console.log('- token:', !!localStorage.getItem('token'));
console.log('- authToken:', !!localStorage.getItem('authToken'));
console.log('- currentUser:', !!localStorage.getItem('currentUser'));

// Test API call to clients endpoint
async function testClientEndpoint() {
  try {
    const token = localStorage.getItem('token');
    console.log('\n🧪 Testing /api/clients endpoint');
    console.log('Token available:', !!token);
    
    const response = await fetch('http://localhost:3001/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const clients = await response.json();
      console.log('✅ Clients received:', clients.length);
      console.log('📋 First client:', clients[0]);
      console.log('📋 Sample client properties:', Object.keys(clients[0] || {}));
    } else {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

// Run the test if we're in browser
if (typeof window !== 'undefined') {
  testClientEndpoint();
}
