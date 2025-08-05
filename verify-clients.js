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

async function verifyClientImport() {
  try {
    console.log('🔍 Verifying client import...\n');
    
    // Total count
    const totalCount = await promiseQuery('SELECT COUNT(*) as count FROM clients');
    console.log(`📊 Total clients: ${totalCount[0].count}`);
    
    // Count by wilaya
    const wilayaStats = await promiseQuery(`
      SELECT wilaya, COUNT(*) as count 
      FROM clients 
      GROUP BY wilaya 
      ORDER BY count DESC 
      LIMIT 10
    `);
    console.log('\n🏛️ Top 10 Wilayas by client count:');
    wilayaStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.wilaya}: ${stat.count} clients`);
    });
    
    // Sample clients with location data
    const clientsWithLocation = await promiseQuery(`
      SELECT COUNT(*) as count 
      FROM clients 
      WHERE location IS NOT NULL AND location != ''
    `);
    console.log(`\n📍 Clients with location data: ${clientsWithLocation[0].count}`);
    
    // Phone number format check
    const phoneStats = await promiseQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN phone != '' THEN 1 END) as with_phone,
        COUNT(CASE WHEN LENGTH(phone) >= 9 THEN 1 END) as valid_phone_length
      FROM clients
    `);
    console.log(`\n📞 Phone statistics:`);
    console.log(`   Total clients: ${phoneStats[0].total}`);
    console.log(`   With phone: ${phoneStats[0].with_phone}`);
    console.log(`   Valid phone length (≥9 digits): ${phoneStats[0].valid_phone_length}`);
    
    // Check for Arabic names
    const arabicNames = await promiseQuery(`
      SELECT full_name, wilaya, city 
      FROM clients 
      WHERE full_name LIKE '%ي%' OR full_name LIKE '%ا%' OR full_name LIKE '%ة%'
      LIMIT 5
    `);
    console.log(`\n🇩🇿 Sample Arabic names:`)
    arabicNames.forEach((client, index) => {
      console.log(`${index + 1}. ${client.full_name} - ${client.city}, ${client.wilaya}`);
    });
    
    console.log('\n✅ Import verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    db.close();
  }
}

verifyClientImport();
