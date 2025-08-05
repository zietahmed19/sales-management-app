const fetch = require('node-fetch');

async function testDelegateLogin() {
  try {
    console.log('🔐 Testing delegate login...');
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'ahmed',
        password: '123456'
      })
    });

    const data = await response.json();
    console.log('Delegate login response:', data);

    if (data.token) {
      console.log('✅ Delegate login successful!');
      await testSalesRetrieval(data.token);
      await testSalesCreation(data.token);
    } else {
      console.log('❌ Delegate login failed');
    }
  } catch (error) {
    console.error('❌ Delegate login error:', error);
  }
}

async function testSalesRetrieval(token) {
  try {
    console.log('\n📊 Testing delegate sales retrieval...');
    const response = await fetch('http://localhost:3001/api/sales', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const sales = await response.json();
    console.log('✅ Delegate sales retrieval response:', {
      status: response.status,
      salesCount: Array.isArray(sales) ? sales.length : 'Not an array',
      sampleSales: Array.isArray(sales) ? sales.slice(0, 2) : sales
    });
  } catch (error) {
    console.error('❌ Sales retrieval error:', error);
  }
}

async function testSalesCreation(token) {
  try {
    console.log('\n💰 Testing sales creation...');
    
    // First get a client and pack
    const clientsResponse = await fetch('http://localhost:3001/api/clients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const clients = await clientsResponse.json();
    
    const packsResponse = await fetch('http://localhost:3001/api/packs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const packs = await packsResponse.json();
    
    if (clients.length > 0 && packs.length > 0) {
      const saleData = {
        clientId: clients[0].id,
        packId: packs[0].id,
        totalPrice: packs[0].total_price || 1000
      };
      
      console.log('Creating sale with data:', saleData);
      
      const response = await fetch('http://localhost:3001/api/sales', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      const result = await response.json();
      console.log('✅ Sales creation response:', {
        status: response.status,
        result: result
      });
    } else {
      console.log('❌ No clients or packs available for testing');
    }
  } catch (error) {
    console.error('❌ Sales creation error:', error);
  }
}

testDelegateLogin();
