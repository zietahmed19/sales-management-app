const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        password: '123456'
      })
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (data.token) {
      console.log('✅ Login successful!');
      await testSalesRetrieval(data.token);
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Login error:', error);
  }
}

async function testSalesRetrieval(token) {
  try {
    console.log('\n📊 Testing sales retrieval...');
    const response = await fetch('http://localhost:3001/api/sales', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const sales = await response.json();
    console.log('✅ Sales retrieval response:', {
      status: response.status,
      salesCount: Array.isArray(sales) ? sales.length : 'Not an array',
      sampleSales: Array.isArray(sales) ? sales.slice(0, 2) : sales
    });
  } catch (error) {
    console.error('❌ Sales retrieval error:', error);
  }
}

testLogin();
