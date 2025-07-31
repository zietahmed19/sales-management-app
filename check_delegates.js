const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🔍 CHECKING CURRENT DELEGATES WILAYA ASSIGNMENTS');
console.log('================================================');

db.all('SELECT id, username, rep_name, city, wilaya FROM representatives ORDER BY id', (err, delegates) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log(`Total Delegates: ${delegates.length}`);
  console.log('');
  console.log('ID | Username         | Name                    | City      | Wilaya');
  console.log('---|------------------|-------------------------|-----------|----------');
  
  let unknownCount = 0;
  delegates.forEach(delegate => {
    const id = delegate.id.toString().padEnd(2);
    const username = delegate.username.padEnd(16);
    const name = delegate.rep_name.padEnd(25);
    const city = (delegate.city || 'Unknown').padEnd(9);
    const wilaya = delegate.wilaya || 'Unknown';
    
    if (wilaya === 'Unknown' || wilaya === 'Oeb') {
      unknownCount++;
      console.log(`${id} | ${username} | ${name} | ${city} | ❌ ${wilaya}`);
    } else {
      console.log(`${id} | ${username} | ${name} | ${city} | ✅ ${wilaya}`);
    }
  });
  
  console.log('');
  console.log(`❌ Delegates with Unknown/Invalid Wilaya: ${unknownCount}`);
  console.log(`✅ Delegates with Valid Wilaya: ${delegates.length - unknownCount}`);
  
  if (unknownCount > 0) {
    console.log('');
    console.log('⚠️  ISSUE: Many delegates have "Unknown" wilaya assignments!');
    console.log('💡 SOLUTION: Need to assign proper Algerian wilaya to each delegate');
  }
  
  db.close();
});
