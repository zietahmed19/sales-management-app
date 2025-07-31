// Debug trace script to test the exact API flow that the frontend uses
const fetch = require('node-fetch');

async function testLoginFlow() {
  console.log('🔄 Step 1: Testing login API...');
  
  try {
    // Step 1: Login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'ahmed',
        password: '123456'
      }),
    });

    console.log('🔐 Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Login failed:', errorText);
      return;
    }

    const { token, user } = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('🔑 Token received:', !!token);
    console.log('👤 User received:', user);
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    
    // Step 2: Test API calls with the token (exactly as frontend does)
    console.log('\n🔄 Step 2: Testing API calls with token...');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('📡 Headers being sent:', headers);
    
    // Test clients endpoint
    console.log('\n🧪 Testing clients endpoint...');
    const clientsResponse = await fetch('http://localhost:3001/api/clients', { headers });
    console.log('📊 Clients response status:', clientsResponse.status);
    console.log('📊 Clients response ok:', clientsResponse.ok);
    
    if (clientsResponse.ok) {
      const clientsData = await clientsResponse.json();
      console.log('📊 Clients count:', clientsData.length);
      console.log('📊 First client:', clientsData[0]);
    } else {
      const errorText = await clientsResponse.text();
      console.error('❌ Clients error:', errorText);
    }
    
    // Test packs endpoint
    console.log('\n🧪 Testing packs endpoint...');
    const packsResponse = await fetch('http://localhost:3001/api/packs', { headers });
    console.log('📋 Packs response status:', packsResponse.status);
    console.log('📋 Packs response ok:', packsResponse.ok);
    
    if (packsResponse.ok) {
      const packsData = await packsResponse.json();
      console.log('📋 Packs count:', packsData.length);
      console.log('📋 First pack:', packsData[0]);
    } else {
      const errorText = await packsResponse.text();
      console.error('❌ Packs error:', errorText);
    }
    
    console.log('\n✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLoginFlow();
