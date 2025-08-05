const fetch = require('node-fetch');

async function createAdmin() {
  try {
    console.log('👑 Creating admin user...');
    const response = await fetch('http://localhost:3001/api/admin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        rep_name: 'System Administrator'
      })
    });

    const data = await response.json();
    console.log('Admin creation response:', data);

    if (response.ok) {
      console.log('✅ Admin user created!');
      await testAdminLogin();
    } else {
      console.log('❌ Admin creation failed or already exists');
      await testAdminLogin(); // Try login anyway
    }
  } catch (error) {
    console.error('❌ Admin creation error:', error);
  }
}

async function testAdminLogin() {
  try {
    console.log('\n🔐 Testing admin login...');
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
    console.log('Admin login response:', data);

    if (data.token) {
      console.log('✅ Admin login successful!');
      await testAdminSalesRetrieval(data.token);
    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.error('❌ Admin login error:', error);
  }
}

async function testAdminSalesRetrieval(token) {
  try {
    console.log('\n👑 Testing admin sales retrieval...');
    const response = await fetch('http://localhost:3001/api/admin/sales', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const sales = await response.json();
    console.log('✅ Admin sales retrieval response:', {
      status: response.status,
      salesCount: Array.isArray(sales) ? sales.length : 'Not an array',
      sampleSales: Array.isArray(sales) ? sales.slice(0, 2) : sales
    });
  } catch (error) {
    console.error('❌ Admin sales retrieval error:', error);
  }
}

createAdmin();
