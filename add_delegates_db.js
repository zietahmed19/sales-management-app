/**
 * Script to add delegates to SQLite database with wilaya assignments
 * Each delegate will be assigned to a specific wilaya for territory management
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'sales_management.db');
const db = new sqlite3.Database(dbPath);

// Wilaya assignments for delegates based on their codes
const delegateWilayaAssignments = {
  'COM 1': 'Setif',
  'COM 2': 'Constantine', 
  'COM 3': 'Annaba',
  'COM 4': 'Batna',
  'COM 5': 'Biskra',
  'COM 6': 'Tebessa',
  'COM 7': 'Souk Ahras',
  'COM 8': 'Khenchela',
  'COM 9': 'Oum El Bouaghi',
  'COM 10': 'Mila',
  'COM 11': 'Jijel',
  'COM 12': 'Skikda',
  'COM 13': 'Guelma',
  'COM 14': 'Bouira',
  'COM 15': 'Tizi Ouzou',
  'COM 16': 'Bejaia',
  'COM 17': 'Boumerdes',
  'COM 18': 'Alger',
  'COM 19': 'Blida',
  'COM 20': 'Tipaza',
  'COM 21': 'Ain Defla',
  'LIV 3': 'Chlef',
  'LIV 4': 'Tissemssilt',
  'LIV 5': 'Tiaret',
  'LIV 6': 'Relizane',
  'LIV 7': 'Mostaganem'
};

// CSV data from delegates
const csvData = `11,COM 1,6,Active,SAGHIRI ABDELKADER,Mohcen Acide
12,COM 10,7,Active,OUCHEN NECEREDDINE,Mohcen Acide
13,COM 12,8,Active,CHAOUCH ISLEM,Mohcen Acide
14,COM 13,9,Active,KERBECHE HOUDHEIFA,Mohcen Acide
15,COM 14,10,Active,SEHIL RAMZI,Mohcen Acide
16,COM 15,11,Active,MERZOUK ELYES,Mohcen Acide
17,COM 16,12,Active,HIDRI NADJIM,Mohcen Acide
18,COM 17,13,Active,HAFSI ABDELOUAHAB,Mohcen Acide
19,COM 18,14,Active,REZIG YOUCEF,Mohcen Acide
20,COM 19,15,Active,SAADAOUI HAMZA,Mohcen Acide
21,COM 2,16,Active,LASMI ABDELHAMID,Mohcen Acide
22,COM 20,17,Active,MAHAR LOKMANE,Mohcen Acide
23,COM 21,18,Active,KADI KHOUBAIB,Mohcen Acide
24,COM 3,19,Active,BOUCHAMA ADIL,Mohcen Acide
25,COM 4,20,Active,ACHAB CHAFIK,Mohcen Acide
26,COM 5,21,Active,KETFI NIDHAL,Mohcen Acide
27,COM 6,22,Active,LEBSIS TAHER,Mohcen Acide
28,COM 7,23,Active,NOUREDDINE TAREK,Mohcen Acide
29,COM 8,24,Active,BOUHOURA ILYES,Mohcen Acide
30,COM 9,25,Active,ADJEL MED,Mohcen Acide
31,LIV 3,26,Active,ZINE EDDINE,Mohcen Acide
32,LIV 4,27,Active,FERRADJ ADEM,Mohcen Acide
33,LIV 5,28,Active,LAOUAMEUR ATIK,Mohcen Acide
34,LIV 6,29,Active,AMARCHI NADJI,Mohcen Acide
35,LIV 7,30,Active,KOUSSA NAIM,Mohcen Acide`;

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

async function addDelegatesToSQLiteDB() {
  try {
    console.log('🔄 Adding delegates to SQLite database...');
    
    // Parse CSV data
    const lines = csvData.trim().split('\n');
    let addedCount = 0;
    let skippedCount = 0;

    for (const line of lines) {
      const [id, repCode, sequence, status, fullName, company] = line.split(',');
      
      // Create username from full name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[nameParts.length - 1].toLowerCase();
      const lastNameInitial = nameParts[0].charAt(0).toLowerCase();
      const username = firstName + lastNameInitial;
      
      // Get assigned wilaya
      const assignedWilaya = delegateWilayaAssignments[repCode.trim()] || 'Unassigned';
      
      // Hash the default password
      const passwordHash = await bcrypt.hash('123456', 10);
      
      try {
        // Check if representative already exists
        const existing = await promiseQuery(
          'SELECT id FROM representatives WHERE username = ? OR rep_code = ?',
          [username, repCode.trim()]
        );
        
        if (existing.length > 0) {
          console.log(`⚠️  Skipped ${fullName.trim()} - already exists`);
          skippedCount++;
          continue;
        }
        
        // Insert new representative
        await promiseRun(`
          INSERT INTO representatives (
            rep_code, rep_name, username, password_hash, 
            phone, city, wilaya
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          repCode.trim(),
          fullName.trim(),
          username,
          passwordHash,
          '0555000000', // Default phone
          assignedWilaya, // City same as wilaya for now
          assignedWilaya
        ]);
        
        console.log(`✅ Added: ${fullName.trim()} → ${username} (${assignedWilaya})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding ${fullName.trim()}:`, error.message);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully added: ${addedCount} delegates`);
    console.log(`⚠️  Skipped existing: ${skippedCount} delegates`);
    
    // Show wilaya distribution
    console.log('\n🗺️  Wilaya Distribution:');
    const wilayaCount = {};
    Object.values(delegateWilayaAssignments).forEach(wilaya => {
      wilayaCount[wilaya] = (wilayaCount[wilaya] || 0) + 1;
    });
    
    Object.entries(wilayaCount).forEach(([wilaya, count]) => {
      console.log(`   ${wilaya}: ${count} delegate(s)`);
    });
    
    console.log('\n🔑 All delegates can login with password: 123456');
    
  } catch (error) {
    console.error('❌ Error adding delegates:', error);
  } finally {
    db.close();
  }
}

// Run the function
addDelegatesToSQLiteDB();
