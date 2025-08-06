const DatabaseBackup = require('./database-backup');
const path = require('path');

async function createFreshBackup() {
  try {
    console.log('🚀 Creating fresh backup of current sales data...');
    
    const dbPath = path.join(__dirname, 'sales_management.db');
    const dbBackup = new DatabaseBackup(dbPath);
    
    const result = await dbBackup.createDeploymentBackup();
    
    console.log('✅ Fresh backup created successfully!');
    console.log('📋 Backup file:', result.filepath);
    
    // Show sales count
    const salesCount = result.backup.tables.sales ? result.backup.tables.sales.length : 0;
    console.log('📊 Sales records backed up:', salesCount);
    
    // Show backup summary
    console.log('\n📈 Backup Summary:');
    Object.keys(result.backup.tables).forEach(tableName => {
      const count = result.backup.tables[tableName].length;
      console.log(`  - ${tableName}: ${count} records`);
    });
    
    console.log('\n💾 This backup preserves your current sales data!');
    console.log('🔄 The server will now use this backup instead of the old one.');
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
  }
}

createFreshBackup();
