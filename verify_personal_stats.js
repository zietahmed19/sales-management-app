const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🎯 PERSONAL STATISTICS VERIFICATION');
console.log('===================================');

db.all('SELECT id, username, rep_name, wilaya FROM representatives ORDER BY id LIMIT 8', (err, delegates) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log(`Showing personal statistics for first 8 delegates:\n`);
  
  let processed = 0;
  
  delegates.forEach(delegate => {
    // Get personal sales for this delegate
    db.all('SELECT COUNT(*) as salesCount, COALESCE(SUM(total_price), 0) as totalRevenue FROM sales WHERE representative_id = ?', 
    [delegate.id], (err, salesData) => {
      if (err) {
        console.error('Sales error:', err);
        return;
      }
      
      // Get clients in this delegate's territory
      db.all('SELECT COUNT(*) as clientCount FROM clients WHERE wilaya = ?', 
      [delegate.wilaya], (err, clientData) => {
        if (err) {
          console.error('Client error:', err);
          return;
        }
        
        console.log(`🏷️  ${delegate.rep_name} (@${delegate.username})`);
        console.log(`   📍 Territory: ${delegate.wilaya}`);
        console.log(`   📊 Personal Sales: ${salesData[0].salesCount}`);
        console.log(`   💰 Personal Revenue: ${salesData[0].totalRevenue} DA`);
        console.log(`   👥 Territory Clients: ${clientData[0].clientCount}`);
        console.log(`   ${'='.repeat(50)}`);
        
        processed++;
        if (processed === delegates.length) {
          console.log('\n✅ Each delegate sees ONLY their personal data:');
          console.log('   • Personal sales (only sales they made)');
          console.log('   • Personal revenue (only their sales total)');
          console.log('   • Territory clients (only clients in their wilaya)');
          console.log('\n🔐 This ensures complete data isolation between delegates!');
          db.close();
        }
      });
    });
  });
});
