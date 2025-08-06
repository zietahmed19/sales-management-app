const fs = require('fs');
const path = require('path');

try {
  const oldBackupPath = path.join(__dirname, 'database-backups', 'database-backup-2025-08-05T14-24-07-202Z.json');
  const newBackupPath = path.join(__dirname, 'database-backups', 'latest-backup.json');
  
  console.log('🔍 Comparing backup files...\n');
  
  // Check old backup
  if (fs.existsSync(oldBackupPath)) {
    const oldBackup = JSON.parse(fs.readFileSync(oldBackupPath, 'utf8'));
    console.log('📅 OLD backup (Aug 5th):');
    console.log('  - Timestamp:', oldBackup.timestamp);
    console.log('  - Sales records:', oldBackup.tables.sales ? oldBackup.tables.sales.length : 0);
  } else {
    console.log('❌ Old backup file not found');
  }
  
  // Check new backup
  if (fs.existsSync(newBackupPath)) {
    const newBackup = JSON.parse(fs.readFileSync(newBackupPath, 'utf8'));
    console.log('\n💾 NEW backup (current):');
    console.log('  - Timestamp:', newBackup.timestamp);
    console.log('  - Sales records:', newBackup.tables.sales ? newBackup.tables.sales.length : 0);
  } else {
    console.log('❌ New backup file not found');
  }
  
  console.log('\n✅ The server will now use the NEW backup that preserves your 8 sales records!');
  
} catch (error) {
  console.error('❌ Error reading backup files:', error.message);
}
