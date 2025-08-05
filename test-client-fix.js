const fetch = require('node-fetch');

async function testClientLookup() {
  try {
    // First login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ramzis', password: '123456' })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful for ramzis');
    
    // Test client lookup directly
    console.log('\n🔍 Testing client lookup...');
    const clientsResponse = await fetch('http://localhost:3001/api/clients', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const clients = await clientsResponse.json();
    console.log('📊 Total clients found:', clients.length);
    
    // Look for client 2362
    const client2362 = clients.find(c => c.client_id === '2362' || c.client_id === 2362);
    if (client2362) {
      console.log('✅ Client 2362 found:', client2362);
      
      // Now test a sale creation
      const packsResponse = await fetch('http://localhost:3001/api/packs', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      const packs = await packsResponse.json();
      
      if (packs.length > 0) {
        console.log('\n💰 Testing sale creation...');
        const saleData = {
          client_id: '2362',
          pack_id: packs[0].id,
          total_amount: 516000
        };
        
        const saleResponse = await fetch('http://localhost:3001/api/sales', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saleData)
        });
        
        const saleResult = await saleResponse.json();
        console.log('📝 Sale creation result:', {
          status: saleResponse.status,
          result: saleResult
        });
      }
    } else {
      console.log('❌ Client 2362 not found in client list');
      // Show a few sample clients
      console.log('📋 Sample clients:');
      clients.slice(0, 5).forEach(c => {
        console.log(`  - ID: ${c.client_id}, Name: ${c.full_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testClientLookup();
