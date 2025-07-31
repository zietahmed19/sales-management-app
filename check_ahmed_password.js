const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🔍 CHECKING AHMED PASSWORD');
console.log('===========================');

db.get('SELECT username, password_hash FROM representatives WHERE username = ?', ['ahmed'], (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else if (row) {
    console.log('Username:', row.username);
    console.log('Password hash:', row.password_hash);
    
    // Check if it's a bcrypt hash
    const bcrypt = require('bcrypt');
    const testPasswords = ['password123', 'ahmed123', 'ahmed', '123456', 'admin'];
    
    console.log('\nTesting common passwords...');
    testPasswords.forEach(pwd => {
      const matches = bcrypt.compareSync(pwd, row.password_hash);
      console.log(`"${pwd}": ${matches ? '✅ MATCH' : '❌ no'}`);
    });
  } else {
    console.log('No user found with username "ahmed"');
  }
  
  db.close();
});
