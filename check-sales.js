const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

db.get('SELECT COUNT(*) as count FROM sales', [], (err, row) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📊 Current sales in database:', row.count);
  }
  db.close();
});
