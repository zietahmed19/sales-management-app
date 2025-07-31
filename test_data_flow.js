// Simple test to replicate the exact issue you're seeing
console.log('🔄 Testing the exact data loading flow...');

async function testDataFlow() {
  console.log('\n🔄 Step 1: Login test');
  
  try {
    // Test login (same as frontend)
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ahmed', password: '123456' })
    });
    
    const { token, user } = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('👤 User:', user.username);
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    
    // Test API calls (exactly like frontend loadData function)
    console.log('\n🔄 Step 2: Testing loadData function equivalent');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('📡 API Base URL: http://localhost:3001/api');
    console.log('📤 Headers:', headers);
    
    // Test single endpoint first (like frontend)
    console.log('\n🧪 Testing single clients endpoint...');
    const testResponse = await fetch('http://localhost:3001/api/clients', { headers });
    console.log('📊 Response status:', testResponse.status);
    console.log('📊 Response ok:', testResponse.ok);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const testData = await testResponse.json();
    console.log('✅ Test data received:', testData.length, 'clients');
    console.log('📊 First client:', testData[0]?.ClientID);
    
    // Test all endpoints (like frontend)
    console.log('\n🔄 Testing all endpoints...');
    const responses = await Promise.all([
      fetch('http://localhost:3001/api/clients', { headers }),
      fetch('http://localhost:3001/api/articles', { headers }),
      fetch('http://localhost:3001/api/gifts', { headers }),
      fetch('http://localhost:3001/api/packs', { headers }),
      fetch('http://localhost:3001/api/sales', { headers }),
    ]);
    
    console.log('📊 Clients response status:', responses[0].status);
    console.log('📦 Articles response status:', responses[1].status);
    console.log('🎁 Gifts response status:', responses[2].status);
    console.log('📋 Packs response status:', responses[3].status);
    console.log('💰 Sales response status:', responses[4].status);
    
    const [clientsData, articlesData, giftsData, packsData, salesData] = await Promise.all([
      responses[0].json(),
      responses[1].json(),
      responses[2].json(),
      responses[3].json(),
      responses[4].json(),
    ]);
    
    console.log('\n✅ Final Results:');
    console.log('📊 Clients count:', clientsData.length);
    console.log('📦 Articles count:', articlesData.length);
    console.log('🎁 Gifts count:', giftsData.length);
    console.log('📋 Packs count:', packsData.length);
    console.log('💰 Sales count:', salesData.length);
    
    console.log('\n🎯 CONCLUSION:');
    if (clientsData.length > 0 && packsData.length > 0) {
      console.log('✅ Backend APIs are working perfectly!');
      console.log('❌ The issue is in the React frontend data handling');
    } else {
      console.log('❌ Backend APIs are returning empty data');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

testDataFlow();
