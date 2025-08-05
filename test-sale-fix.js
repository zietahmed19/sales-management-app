const fetch = require('node-fetch');

async function testSaleCreation() {
  try {
    // Login as ramzis (who is in Batna wilaya, same as client 2362)
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ramzis', password: '123456' })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful for ramzis (Batna wilaya)');
    
    // Get available packs
    const packsResponse = await fetch('http://localhost:3001/api/packs', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const packs = await packsResponse.json();
    console.log('📦 Available packs:', packs.length);
    
    if (packs.length > 0) {
      console.log('🎯 Using pack:', packs[0]);
      
      // Test sale creation with client 2362
      const saleData = {
        client_id: '2362',  // String format as it appears in DB
        pack_id: packs[0].id,
        total_amount: 516000
      };
      
      console.log('\n💰 Creating sale with data:', saleData);
      
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
        success: saleResponse.ok,
        result: saleResult
      });
      
      if (saleResponse.ok) {
        console.log('🎉 SUCCESS! Sale created successfully!');
      } else {
        console.log('❌ Sale creation failed');
      }
    } else {
      console.log('❌ No packs available for testing');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSaleCreation();
