const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

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

const importClients = async () => {
  try {
    console.log('🔄 Starting client import...');

    // Read the JSON file
    const clientsJson = JSON.parse(fs.readFileSync('./client_list13.json', 'utf8'));
    console.log(`📋 Found ${clientsJson.length} clients to import`);

    // Get the current max client ID to continue numbering
    const lastClient = await promiseQuery('SELECT MAX(id) as max_id FROM clients');
    let nextId = (lastClient[0].max_id || 0) + 1;

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const client of clientsJson) {
      try {
        // Generate client ID
        const clientId = `C${nextId.toString().padStart(3, '0')}`;

        // Extract city from commune or use wilaya
        const city = client.Commune && client.Commune !== client.Wilaya ? client.Commune : client.Wilaya;
        
        // Format location (coordinates)
        const location = client.Location || '';

        // Check if client already exists by name and phone
        const existingClient = await promiseQuery(
          'SELECT id FROM clients WHERE full_name = ? AND phone = ?',
          [client.Name, client.Phone]
        );

        if (existingClient.length > 0) {
          skipped++;
          console.log(`⏭️  Skipped duplicate: ${client.Name}`);
          continue;
        }

        // Insert the client
        await promiseRun(`
          INSERT INTO clients (client_id, full_name, city, wilaya, phone, location)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          clientId,
          client.Name,
          city,
          client.Wilaya,
          client.Phone,
          location
        ]);

        imported++;
        nextId++;

        if (imported % 100 === 0) {
          console.log(`📊 Progress: ${imported} clients imported...`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error importing client ${client.Name}:`, error.message);
      }
    }

    console.log('\n✅ Import completed!');
    console.log(`📈 Summary:`);
    console.log(`   - Imported: ${imported} clients`);
    console.log(`   - Skipped (duplicates): ${skipped} clients`);
    console.log(`   - Errors: ${errors} clients`);
    console.log(`   - Total processed: ${imported + skipped + errors} clients`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    db.close();
  }
};

// Run the import
importClients();
