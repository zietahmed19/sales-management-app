const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

// Helper function to promisify database operations
const promiseRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const promiseQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function cleanAndImportClients() {
  try {
    console.log('🔄 Starting client data cleanup and import...');
    
    // Read the JSON file
    const jsonData = fs.readFileSync('./ClientsData.json', 'utf8');
    const clientsData = JSON.parse(jsonData);
    
    console.log(`📁 Found ${clientsData.length} clients in JSON file`);
    
    // Check current clients count
    const currentClients = await promiseQuery('SELECT COUNT(*) as count FROM clients');
    console.log(`🗃️ Current clients in database: ${currentClients[0].count}`);
    
    // Clear existing clients
    console.log('🧹 Clearing existing clients...');
    const deleteResult = await promiseRun('DELETE FROM clients');
    console.log(`✅ Deleted ${deleteResult.changes} existing clients`);
    
    // Reset auto-increment counter
    await promiseRun('DELETE FROM sqlite_sequence WHERE name="clients"');
    console.log('🔄 Reset auto-increment counter');
    
    // Import new clients
    console.log('📥 Starting import of new clients...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < clientsData.length; i++) {
      const client = clientsData[i];
      
      try {
        // Validate required fields
        if (!client.ClientID || !client.FullName || !client.City) {
          console.log(`⚠️ Skipping client ${i + 1}: Missing required fields`);
          errorCount++;
          continue;
        }
        
        // Convert phone number to string and handle null
        let phone = '';
        if (client.AllPhones) {
          // Handle both number and string formats
          phone = String(client.AllPhones).replace('.0', ''); // Remove .0 if present
        }
        
        // Insert client
        await promiseRun(`
          INSERT INTO clients (client_id, full_name, city, wilaya, phone, location, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          String(client.ClientID),
          client.FullName.trim(),
          client.City.trim(),
          client.Wilaya ? client.Wilaya.trim() : client.City.trim(),
          phone,
          client.Location || null
        ]);
        
        successCount++;
        
        // Progress indicator
        if ((i + 1) % 100 === 0) {
          console.log(`📊 Progress: ${i + 1}/${clientsData.length} clients processed`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing client ${client.ClientID}:`, error.message);
        errorCount++;
      }
    }
    
    // Final verification
    const finalCount = await promiseQuery('SELECT COUNT(*) as count FROM clients');
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${successCount} clients`);
    console.log(`❌ Errors encountered: ${errorCount} clients`);
    console.log(`📊 Total clients in database: ${finalCount[0].count}`);
    
    // Show sample of imported data
    const sampleClients = await promiseQuery('SELECT * FROM clients LIMIT 5');
    console.log('\n📋 Sample of imported clients:');
    sampleClients.forEach((client, index) => {
      console.log(`${index + 1}. ID: ${client.client_id}, Name: ${client.full_name}, City: ${client.city}, Wilaya: ${client.wilaya}`);
    });
    
  } catch (error) {
    console.error('💥 Fatal error during import:', error);
  } finally {
    db.close();
    console.log('🔐 Database connection closed');
  }
}

// Run the import
cleanAndImportClients();
