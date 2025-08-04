const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

// Function to promisify database operations
const promiseRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

async function updateQuantities() {
  try {
    console.log('🔄 Updating pack quantities...');
    
    // Pack A: Spark Go 1 64+3 (id=9) = 30, Spark Go 1 128+4 (id=10) = 20
    await promiseRun('UPDATE pack_articles SET quantity = 30 WHERE pack_id = 1 AND article_id = 9');
    await promiseRun('UPDATE pack_articles SET quantity = 20 WHERE pack_id = 1 AND article_id = 10');
    console.log('✅ Pack A quantities updated: Spark Go 1 64+3 (30), Spark Go 1 128+4 (20)');
    
    // Pack B: Spark Go 1 64+3 (id=9) = 20, Spark Go 1 128+4 (id=10) = 10
    await promiseRun('UPDATE pack_articles SET quantity = 20 WHERE pack_id = 2 AND article_id = 9');
    await promiseRun('UPDATE pack_articles SET quantity = 10 WHERE pack_id = 2 AND article_id = 10');
    console.log('✅ Pack B quantities updated: Spark Go 1 64+3 (20), Spark Go 1 128+4 (10)');
    
    // Pack C: Spark Go 1 64+3 (id=9) = 8, Spark Go 1 128+4 (id=10) = 5
    await promiseRun('UPDATE pack_articles SET quantity = 8 WHERE pack_id = 3 AND article_id = 9');
    await promiseRun('UPDATE pack_articles SET quantity = 5 WHERE pack_id = 3 AND article_id = 10');
    console.log('✅ Pack C quantities updated: Spark Go 1 64+3 (8), Spark Go 1 128+4 (5)');
    
    console.log('🎉 All quantities updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating quantities:', error);
  } finally {
    db.close();
  }
}

updateQuantities();
