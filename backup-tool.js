const DatabaseBackup = require('./database-backup');
const path = require('path');

const dbPath = path.join(__dirname, 'sales_management.db');
const dbBackup = new DatabaseBackup(dbPath);

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'backup':
      console.log('🔄 Creating database backup...');
      try {
        const result = await dbBackup.createDeploymentBackup();
        console.log('✅ Backup created successfully!');
        console.log('📁 File:', path.basename(result.filepath));
        
        // Show what was backed up
        const tables = Object.keys(result.backup.tables);
        console.log('\n📊 Backed up tables:');
        tables.forEach(table => {
          const count = result.backup.tables[table].length;
          console.log(`  - ${table}: ${count} records`);
        });
      } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
      }
      break;
      
    case 'restore':
      console.log('🔄 Restoring from latest backup...');
      try {
        const result = await dbBackup.restoreFromLatest();
        console.log(`✅ Restored ${result.restored} of ${result.total} sales records`);
      } catch (error) {
        console.error('❌ Restore failed:', error);
        process.exit(1);
      }
      break;
      
    case 'status':
      console.log('📊 Backup status:');
      try {
        const stats = dbBackup.getBackupStats();
        if (stats.length === 0) {
          console.log('📭 No backups found');
        } else {
          console.log(`📈 Total backups: ${stats.length}`);
          console.log('\n📋 Recent backups:');
          stats.slice(0, 5).forEach((backup, index) => {
            console.log(`  ${index + 1}. ${backup.filename}`);
            console.log(`     Created: ${backup.created.toLocaleString()}`);
            console.log(`     Size: ${(backup.size / 1024).toFixed(1)} KB`);
          });
        }
      } catch (error) {
        console.error('❌ Error checking status:', error);
        process.exit(1);
      }
      break;
      
    default:
      console.log('🔧 Database Backup Tool');
      console.log('');
      console.log('Usage:');
      console.log('  node backup-tool.js backup   - Create a new backup');
      console.log('  node backup-tool.js restore  - Restore from latest backup');
      console.log('  node backup-tool.js status   - Show backup status');
      console.log('');
      console.log('Examples:');
      console.log('  node backup-tool.js backup');
      console.log('  node backup-tool.js restore');
      break;
  }
}

main();
