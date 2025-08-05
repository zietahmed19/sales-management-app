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

const promiseRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

async function fixSalesDataIssues() {
  try {
    console.log('🔧 Fixing sales data issues...\n');
    
    // First, let's identify the specific foreign key issues
    console.log('🔍 Checking for sales with invalid client references...');
    const invalidClientSales = await promiseQuery(`
      SELECT s.id, s.client_id, s.representative_id, s.pack_id, s.total_price, s.created_at
      FROM sales s
      WHERE s.client_id NOT IN (SELECT id FROM clients)
    `);
    
    console.log(`Found ${invalidClientSales.length} sales with invalid client references:`);
    invalidClientSales.forEach(sale => {
      console.log(`   Sale ID: ${sale.id}, Invalid Client ID: ${sale.client_id}, Rep: ${sale.representative_id}, Date: ${sale.created_at}`);
    });
    
    console.log('\n🔍 Checking for sales with invalid representative references...');
    const invalidRepSales = await promiseQuery(`
      SELECT s.id, s.client_id, s.representative_id, s.pack_id, s.total_price, s.created_at
      FROM sales s
      WHERE s.representative_id NOT IN (SELECT id FROM representatives)
    `);
    
    console.log(`Found ${invalidRepSales.length} sales with invalid representative references:`);
    invalidRepSales.forEach(sale => {
      console.log(`   Sale ID: ${sale.id}, Client: ${sale.client_id}, Invalid Rep ID: ${sale.representative_id}, Date: ${sale.created_at}`);
    });
    
    console.log('\n🔍 Checking for sales with invalid pack references...');
    const invalidPackSales = await promiseQuery(`
      SELECT s.id, s.client_id, s.representative_id, s.pack_id, s.total_price, s.created_at
      FROM sales s
      WHERE s.pack_id NOT IN (SELECT id FROM packs)
    `);
    
    console.log(`Found ${invalidPackSales.length} sales with invalid pack references:`);
    invalidPackSales.forEach(sale => {
      console.log(`   Sale ID: ${sale.id}, Client: ${sale.client_id}, Rep: ${sale.representative_id}, Invalid Pack ID: ${sale.pack_id}, Date: ${sale.created_at}`);
    });
    
    // Check what packs are available
    const availablePacks = await promiseQuery('SELECT id, pack_name FROM packs ORDER BY id');
    console.log('\n📦 Available packs:');
    availablePacks.forEach(pack => {
      console.log(`   ID: ${pack.id}, Name: ${pack.pack_name}`);
    });
    
    // Check what representatives are available
    const availableReps = await promiseQuery('SELECT id, rep_name, username FROM representatives ORDER BY id LIMIT 10');
    console.log('\n👥 Sample representatives:');
    availableReps.forEach(rep => {
      console.log(`   ID: ${rep.id}, Name: ${rep.rep_name}, Username: ${rep.username}`);
    });
    
    // Let's try to fix the invalid sales by mapping them to valid references
    console.log('\n🔧 Attempting to fix invalid sales...');
    
    let fixedCount = 0;
    
    // Fix invalid pack references by mapping to the first available pack
    if (invalidPackSales.length > 0 && availablePacks.length > 0) {
      const defaultPackId = availablePacks[0].id;
      console.log(`Mapping invalid pack references to Pack ID: ${defaultPackId} (${availablePacks[0].pack_name})`);
      
      for (const sale of invalidPackSales) {
        await promiseRun(`
          UPDATE sales SET pack_id = ? WHERE id = ?
        `, [defaultPackId, sale.id]);
        fixedCount++;
        console.log(`   Fixed sale ${sale.id}: pack_id ${sale.pack_id} → ${defaultPackId}`);
      }
    }
    
    // For client issues, we need to be more careful
    // Let's see if we can map the client_id to the new client structure
    if (invalidClientSales.length > 0) {
      console.log('\n🔍 Analyzing client mapping issues...');
      
      // Check if these are old numeric IDs that need to be mapped to new client structure
      for (const sale of invalidClientSales) {
        // Try to find a client with a similar ID in the client_id field (string format)
        const possibleClient = await promiseQuery(`
          SELECT id, client_id, full_name 
          FROM clients 
          WHERE client_id = ? OR client_id = ?
        `, [String(sale.client_id), sale.client_id]);
        
        if (possibleClient.length > 0) {
          console.log(`   Sale ${sale.id}: Found matching client ${possibleClient[0].id} (${possibleClient[0].full_name})`);
          await promiseRun(`
            UPDATE sales SET client_id = ? WHERE id = ?
          `, [possibleClient[0].id, sale.id]);
          fixedCount++;
        } else {
          // Map to a default client or mark for deletion
          console.log(`   Sale ${sale.id}: No matching client found for ID ${sale.client_id}`);
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} sales records`);
    
    // Final verification
    const remainingIssues = await promiseQuery(`
      SELECT COUNT(*) as count FROM sales s
      WHERE s.client_id NOT IN (SELECT id FROM clients)
      OR s.representative_id NOT IN (SELECT id FROM representatives)
      OR s.pack_id NOT IN (SELECT id FROM packs)
    `);
    
    console.log(`\n📊 Remaining sales with foreign key issues: ${remainingIssues[0].count}`);
    
    if (remainingIssues[0].count > 0) {
      console.log('\n⚠️ Some sales still have foreign key issues. Consider:');
      console.log('   1. Deleting orphaned sales');
      console.log('   2. Creating placeholder records');
      console.log('   3. Manual data mapping');
    } else {
      console.log('\n🎉 All foreign key issues resolved!');
    }
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    db.close();
  }
}

fixSalesDataIssues();
