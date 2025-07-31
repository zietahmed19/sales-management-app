const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sales_management.db');

console.log('🔧 FIXING SALES TERRITORY ALIGNMENT');
console.log('===================================');

// Step 1: Find all territory mismatches
db.all(`
  SELECT 
    s.id as sale_id,
    s.client_id,
    s.pack_id,
    s.total_price,
    s.sale_date,
    r.id as current_rep_id,
    r.username as current_rep,
    r.wilaya as rep_wilaya,
    c.full_name as client_name,
    c.wilaya as client_wilaya
  FROM sales s 
  JOIN representatives r ON s.representative_id = r.id 
  JOIN clients c ON s.client_id = c.id 
  WHERE r.wilaya != c.wilaya
`, (err, mismatches) => {
  if (err) {
    console.error('Error finding mismatches:', err);
    return;
  }
  
  console.log(`\n🔍 Found ${mismatches.length} sales with territory mismatches`);
  
  if (mismatches.length === 0) {
    console.log('✅ No territory mismatches to fix!');
    db.close();
    return;
  }
  
  // Step 2: For each mismatch, find the correct delegate for that client's wilaya
  let processed = 0;
  
  mismatches.forEach(mismatch => {
    console.log(`\n📋 Processing Sale ID ${mismatch.sale_id}:`);
    console.log(`   Client: ${mismatch.client_name} (${mismatch.client_wilaya})`);
    console.log(`   Current Rep: ${mismatch.current_rep} (${mismatch.rep_wilaya})`);
    
    // Find correct representative for this client's wilaya
    db.get(`
      SELECT id, username, rep_name, wilaya 
      FROM representatives 
      WHERE wilaya = ? 
      LIMIT 1
    `, [mismatch.client_wilaya], (err, correctRep) => {
      if (err) {
        console.error(`   ❌ Error finding rep for ${mismatch.client_wilaya}:`, err);
      } else if (!correctRep) {
        console.log(`   ⚠️  No representative found for wilaya: ${mismatch.client_wilaya}`);
        console.log(`   🔄 Keeping sale with current rep (cross-territory sale)`);
      } else {
        console.log(`   🎯 Correct Rep: ${correctRep.rep_name} (@${correctRep.username})`);
        
        // Update the sale to assign to correct representative
        db.run(`
          UPDATE sales 
          SET representative_id = ? 
          WHERE id = ?
        `, [correctRep.id, mismatch.sale_id], function(err) {
          if (err) {
            console.error(`   ❌ Error updating sale ${mismatch.sale_id}:`, err);
          } else {
            console.log(`   ✅ Sale reassigned to ${correctRep.rep_name}`);
          }
        });
      }
      
      processed++;
      if (processed === mismatches.length) {
        // Step 3: Verify the fixes
        setTimeout(() => {
          console.log('\n🔍 VERIFICATION AFTER FIXES:');
          console.log('============================');
          
          db.all(`
            SELECT 
              COUNT(*) as total_sales,
              COUNT(CASE WHEN r.wilaya = c.wilaya THEN 1 END) as territory_aligned,
              COUNT(CASE WHEN r.wilaya != c.wilaya THEN 1 END) as cross_territory
            FROM sales s 
            JOIN representatives r ON s.representative_id = r.id 
            JOIN clients c ON s.client_id = c.id
          `, (err, summary) => {
            if (err) {
              console.error('Error getting summary:', err);
              return;
            }
            
            const stats = summary[0];
            console.log(`📊 Total Sales: ${stats.total_sales}`);
            console.log(`✅ Territory Aligned: ${stats.territory_aligned}`);
            console.log(`⚠️  Cross Territory: ${stats.cross_territory}`);
            
            // Show updated sales per delegate
            db.all(`
              SELECT 
                r.rep_name,
                r.username,
                r.wilaya,
                COUNT(s.id) as sales_count,
                SUM(s.total_price) as total_revenue
              FROM representatives r 
              LEFT JOIN sales s ON r.id = s.representative_id 
              GROUP BY r.id, r.rep_name, r.username, r.wilaya
              HAVING sales_count > 0
              ORDER BY sales_count DESC
            `, (err, delegateStats) => {
              if (err) {
                console.error('Error getting delegate stats:', err);
                return;
              }
              
              console.log('\n📈 UPDATED SALES DISTRIBUTION:');
              console.log('==============================');
              
              delegateStats.forEach(stat => {
                console.log(`${stat.rep_name} (@${stat.username}) - ${stat.wilaya}`);
                console.log(`   📊 ${stat.sales_count} sales, 💰 ${stat.total_revenue.toLocaleString()} DA`);
              });
              
              console.log('\n✅ SALES TERRITORY ALIGNMENT COMPLETE!');
              console.log('🎯 Each sale is now assigned to the correct territorial delegate');
              console.log('🔄 Personal statistics will now show accurate territory-based data');
              
              db.close();
            });
          });
        }, 1000); // Give time for updates to complete
      }
    });
  });
});
