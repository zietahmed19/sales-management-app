const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🔍 CHECKING ALL TABLE STRUCTURES');
console.log('================================');

const tables = ['sales', 'clients', 'representatives', 'packs'];

let completed = 0;

tables.forEach(tableName => {
  console.log(`\n📋 ${tableName.toUpperCase()} Table Structure:`);
  console.log('=' .repeat(tableName.length + 20));
  
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`Error checking ${tableName} table:`, err);
    } else {
      columns.forEach(col => {
        console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
      });
    }
    
    completed++;
    if (completed === tables.length) {
      // Now get sample data with correct column names
      console.log('\n🔍 SAMPLE DATA CHECK');
      console.log('===================');
      
      // Check clients table first
      db.all("SELECT * FROM clients LIMIT 3", (err, clients) => {
        if (err) {
          console.error('Error fetching clients:', err);
        } else {
          console.log('\n👥 Sample Clients:');
          clients.forEach(client => {
            console.log(`  - ID: ${client.id}, Name: ${Object.keys(client).find(k => k.toLowerCase().includes('name')) ? client[Object.keys(client).find(k => k.toLowerCase().includes('name'))] : 'Unknown'}`);
          });
        }
        
        // Check sales
        db.all("SELECT * FROM sales LIMIT 3", (err, sales) => {
          if (err) {
            console.error('Error fetching sales:', err);
          } else {
            console.log('\n💰 Sample Sales:');
            sales.forEach(sale => {
              console.log(`  - Sale ID: ${sale.id}, Client: ${sale.client_id}, Rep: ${sale.representative_id}, Pack: ${sale.pack_id}`);
            });
          }
          
          db.close();
        });
      });
    }
  });
});
