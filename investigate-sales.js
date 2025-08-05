const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

const promiseQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function investigateSalesData() {
  try {
    console.log('🔍 Investigating sales data persistence issue...\n');
    
    // Check database file info
    console.log(`📁 Database path: ${dbPath}`);
    
    // Check if database file exists
    const fs = require('fs');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`📊 Database file size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 Database last modified: ${stats.mtime}`);
    } else {
      console.log('❌ Database file does not exist!');
      return;
    }
    
    // Check total sales count
    const totalSales = await promiseQuery('SELECT COUNT(*) as count FROM sales');
    console.log(`\n💰 Total sales records: ${totalSales[0].count}`);
    
    if (totalSales[0].count === 0) {
      console.log('⚠️ No sales records found - this might explain the issue!');
      
      // Check if tables exist
      const tables = await promiseQuery(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
      console.log('\n📋 Available tables:');
      tables.forEach(table => console.log(`   - ${table.name}`));
      
      // Check sales table structure
      const salesSchema = await promiseQuery(`
        PRAGMA table_info(sales)
      `);
      console.log('\n🏗️ Sales table structure:');
      salesSchema.forEach(col => {
        console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
    } else {
      // Show recent sales
      const recentSales = await promiseQuery(`
        SELECT s.*, c.full_name as client_name, r.rep_name, p.pack_name
        FROM sales s
        LEFT JOIN clients c ON s.client_id = c.id
        LEFT JOIN representatives r ON s.representative_id = r.id
        LEFT JOIN packs p ON s.pack_id = p.id
        ORDER BY s.created_at DESC
        LIMIT 10
      `);
      
      console.log('\n📈 Recent sales (last 10):');
      recentSales.forEach((sale, index) => {
        console.log(`${index + 1}. Sale ID: ${sale.id}, Client: ${sale.client_name || 'Unknown'}, Rep: ${sale.rep_name || 'Unknown'}, Pack: ${sale.pack_name || 'Unknown'}, Price: ${sale.total_price}, Date: ${sale.created_at}`);
      });
      
      // Check sales by date
      const salesByDate = await promiseQuery(`
        SELECT DATE(created_at) as sale_date, COUNT(*) as count
        FROM sales
        GROUP BY DATE(created_at)
        ORDER BY sale_date DESC
        LIMIT 10
      `);
      
      console.log('\n📅 Sales by date:');
      salesByDate.forEach(stat => {
        console.log(`   ${stat.sale_date}: ${stat.count} sales`);
      });
    }
    
    // Check other table counts for context
    const clientCount = await promiseQuery('SELECT COUNT(*) as count FROM clients');
    const repCount = await promiseQuery('SELECT COUNT(*) as count FROM representatives');
    const packCount = await promiseQuery('SELECT COUNT(*) as count FROM packs');
    
    console.log('\n📊 Other table statistics:');
    console.log(`   Clients: ${clientCount[0].count}`);
    console.log(`   Representatives: ${repCount[0].count}`);
    console.log(`   Packs: ${packCount[0].count}`);
    
    // Check for any foreign key constraint issues
    const orphanedSales = await promiseQuery(`
      SELECT COUNT(*) as count FROM sales s
      WHERE s.client_id NOT IN (SELECT id FROM clients)
      OR s.representative_id NOT IN (SELECT id FROM representatives)
      OR s.pack_id NOT IN (SELECT id FROM packs)
    `);
    
    if (orphanedSales[0].count > 0) {
      console.log(`\n⚠️ Found ${orphanedSales[0].count} sales with invalid foreign keys!`);
    }
    
    console.log('\n✅ Investigation completed!');
    
  } catch (error) {
    console.error('❌ Error during investigation:', error);
  } finally {
    db.close();
  }
}

investigateSalesData();
