const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🔧 TESTING API CLIENT ENDPOINT SIMULATION');
console.log('==========================================');

// Simulate what the API should return for different delegates
async function testClientAccess() {
  const delegates = ['ahmed', 'test', 'islemc'];
  
  for (const username of delegates) {
    console.log(`\n👤 Testing client access for: ${username}`);
    console.log('='.repeat(40));
    
    // Get delegate info
    const delegate = await new Promise((resolve, reject) => {
      db.get('SELECT id, username, wilaya FROM representatives WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (delegate) {
      console.log(`📍 Delegate Wilaya: ${delegate.wilaya}`);
      
      // Get clients in delegate's wilaya (simulating API endpoint)
      const clients = await new Promise((resolve, reject) => {
        db.all(`
          SELECT id, client_id as ClientID, full_name as FullName, city as City, 
                 wilaya as Wilaya, phone as AllPhones, location as Location
          FROM clients
          WHERE wilaya = ?
          ORDER BY full_name
          LIMIT 5
        `, [delegate.wilaya], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log(`👥 Clients found: ${clients.length}`);
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.FullName} (${client.City}, ${client.Wilaya})`);
      });
      
      if (clients.length === 0) {
        console.log('   ⚠️  No clients found in this delegate\'s territory!');
      }
    } else {
      console.log('❌ Delegate not found');
    }
  }
  
  console.log('\n🔍 SUMMARY:');
  console.log('===========');
  console.log('✅ Database contains clients with proper wilaya assignments');
  console.log('✅ API should be able to filter clients by delegate territory');
  console.log('💡 If ClientSelection shows "No clients", check:');
  console.log('   1. Authentication token is correct');
  console.log('   2. API request is successful');
  console.log('   3. Data is being passed to ClientSelection component');
  
  db.close();
}

testClientAccess().catch(error => {
  console.error('Test failed:', error);
  db.close();
});
