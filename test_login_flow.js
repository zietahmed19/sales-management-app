console.log('🔧 DEBUGGING SALES FLOW ISSUE');
console.log('==============================');

// Check what happens when we log in as Ahmed and try to access clients
const testLogin = async () => {
  try {
    console.log('🔐 Testing login for Ahmed...');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'ahmed',
        password: '123456'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('Token received:', loginData.token.substring(0, 50) + '...');
      
      // Now test clients endpoint with this token
      const clientsResponse = await fetch('http://localhost:3001/api/clients', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('\n📡 Clients API Response:');
      console.log('Status:', clientsResponse.status);
      console.log('OK:', clientsResponse.ok);
      
      if (clientsResponse.ok) {
        const clients = await clientsResponse.json();
        console.log('✅ Clients received:', clients.length);
        console.log('📋 Sample client:', clients[0]);
        
        // This is what should be available to the ClientSelection component
        console.log('\n💡 RESULT: ClientSelection should receive data with', clients.length, 'clients');
        console.log('💡 If it shows "No clients", the issue is in the React app data flow');
      } else {
        const error = await clientsResponse.text();
        console.error('❌ Clients API Error:', error);
      }
    } else {
      const error = await loginResponse.text();
      console.error('❌ Login failed:', error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testLogin();
