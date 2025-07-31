const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🔍 CHECKING SALES DATA STRUCTURE');
console.log('================================');

// Check sales table structure
db.all("PRAGMA table_info(sales)", (err, columns) => {
  if (err) {
    console.error('Error checking sales table:', err);
    return;
  }
  
  console.log('📋 Sales Table Structure:');
  columns.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}`);
  });
  
  // Check current sales data
  db.all(`
    SELECT 
      s.id,
      s.representative_id,
      s.client_id,
      s.pack_id,
      s.sale_date,
      s.total_price,
      r.username as delegate_username,
      r.wilaya as delegate_wilaya,
      c.FullName as client_name,
      c.wilaya as client_wilaya,
      p.PackName as pack_name,
      p.TotalPackPrice as pack_price
    FROM sales s 
    LEFT JOIN representatives r ON s.representative_id = r.id 
    LEFT JOIN clients c ON s.client_id = c.id 
    LEFT JOIN packs p ON s.pack_id = p.id
    ORDER BY s.sale_date DESC
    LIMIT 10
  `, (err, sales) => {
    if (err) {
      console.error('Error fetching sales:', err);
      return;
    }
    
    console.log('\n📊 Current Sales Data (Last 10):');
    console.log('===============================');
    
    if (sales.length === 0) {
      console.log('❌ No sales found in database!');
    } else {
      sales.forEach((sale, index) => {
        console.log(`${index + 1}. Sale ID: ${sale.id}`);
        console.log(`   Delegate: ${sale.delegate_username} (${sale.delegate_wilaya})`);
        console.log(`   Client: ${sale.client_name} (${sale.client_wilaya})`);
        console.log(`   Pack: ${sale.pack_name} - ${sale.pack_price} DA`);
        console.log(`   Total: ${sale.total_price} DA`);
        console.log(`   Date: ${sale.sale_date}`);
        console.log('   ---');
      });
    }
    
    // Check for mismatched territories (sales where delegate wilaya != client wilaya)
    db.all(`
      SELECT 
        s.id,
        r.username,
        r.wilaya as delegate_wilaya,
        c.FullName,
        c.wilaya as client_wilaya
      FROM sales s 
      JOIN representatives r ON s.representative_id = r.id 
      JOIN clients c ON s.client_id = c.id 
      WHERE r.wilaya != c.wilaya
    `, (err, mismatches) => {
      if (err) {
        console.error('Error checking mismatches:', err);
        return;
      }
      
      console.log('\n⚠️  TERRITORY MISMATCHES:');
      console.log('========================');
      
      if (mismatches.length === 0) {
        console.log('✅ No territory mismatches found!');
      } else {
        console.log(`❌ Found ${mismatches.length} sales with territory mismatches:`);
        mismatches.forEach(mismatch => {
          console.log(`   - ${mismatch.username} (${mismatch.delegate_wilaya}) sold to ${mismatch.FullName} (${mismatch.client_wilaya})`);
        });
      }
      
      // Count sales per delegate
      db.all(`
        SELECT 
          r.username,
          r.wilaya,
          COUNT(s.id) as sales_count,
          SUM(COALESCE(s.total_price, p.TotalPackPrice)) as total_revenue
        FROM representatives r 
        LEFT JOIN sales s ON r.id = s.representative_id 
        LEFT JOIN packs p ON s.pack_id = p.id
        GROUP BY r.id, r.username, r.wilaya
        ORDER BY sales_count DESC
      `, (err, delegateStats) => {
        if (err) {
          console.error('Error getting delegate stats:', err);
          return;
        }
        
        console.log('\n📈 SALES PER DELEGATE:');
        console.log('=====================');
        
        delegateStats.forEach(stat => {
          const revenue = stat.total_revenue || 0;
          console.log(`${stat.username} (${stat.wilaya}): ${stat.sales_count} sales, ${revenue.toLocaleString()} DA`);
        });
        
        console.log('\n🔧 DIAGNOSIS COMPLETE');
        console.log('====================');
        
        db.close();
      });
    });
  });
});
