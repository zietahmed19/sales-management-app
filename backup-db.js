const fs = require('fs');
const path = require('path');

class DatabaseBackupManager {
  constructor(dbPath = 'sales_management.db') {
    this.dbPath = dbPath;
    this.backupDir = 'database-backups';
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Method 1: Direct SQLite Database File Backup
   * Fastest and most reliable - copies the entire .db file
   */
  async createDatabaseFileBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}.db`);
      const latestBackupPath = path.join(this.backupDir, 'latest-backup.db');
      
      console.log('🔄 Creating database file backup...');
      
      // Copy the database file
      fs.copyFileSync(this.dbPath, backupPath);
      fs.copyFileSync(this.dbPath, latestBackupPath);
      
      const stats = fs.statSync(backupPath);
      console.log(`✅ Database backup created: ${backupPath}`);
      console.log(`📂 Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`💾 Latest backup: ${latestBackupPath}`);
      
      return backupPath;
    } catch (error) {
      console.error('❌ Error creating database backup:', error);
      throw error;
    }
  }

  /**
   * Method 2: SQLite VACUUM INTO Backup
   * Creates optimized backup and removes unused space
   */
  async createVacuumBackup() {
    const sqlite3 = require('sqlite3').verbose();
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `vacuum-backup-${timestamp}.db`);
      
      console.log('🔄 Creating optimized VACUUM backup...');
      
      db.run(`VACUUM INTO '${backupPath}'`, (err) => {
        if (err) {
          console.error('❌ VACUUM backup failed:', err);
          reject(err);
        } else {
          const stats = fs.statSync(backupPath);
          console.log(`✅ VACUUM backup created: ${backupPath}`);
          console.log(`📂 Size: ${(stats.size / 1024).toFixed(2)} KB (optimized)`);
          
          db.close();
          resolve(backupPath);
        }
      });
    });
  }

  /**
   * Method 3: SQL Dump Backup
   * Creates a .sql file with all commands to recreate the database
   */
  async createSQLDumpBackup() {
    const sqlite3 = require('sqlite3').verbose();
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `sql-dump-${timestamp}.sql`);
      
      console.log('🔄 Creating SQL dump backup...');
      
      let sqlDump = '-- SQLite Database Dump\n';
      sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
      sqlDump += '-- \n\n';
      
      // Get all table schemas
      db.all("SELECT sql FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Add CREATE TABLE statements
        tables.forEach(table => {
          if (table.sql) {
            sqlDump += table.sql + ';\n\n';
          }
        });
        
        // Get table names for data export
        const tableNames = tables.map(t => {
          const match = t.sql.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i);
          return match ? match[1] : null;
        }).filter(Boolean);
        
        let processedTables = 0;
        
        tableNames.forEach(tableName => {
          db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) {
              console.error(`Error exporting ${tableName}:`, err);
            } else if (rows.length > 0) {
              sqlDump += `-- Data for table ${tableName}\n`;
              
              rows.forEach(row => {
                const columns = Object.keys(row);
                const values = columns.map(col => {
                  const val = row[col];
                  if (val === null) return 'NULL';
                  if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                  return val;
                });
                
                sqlDump += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
              });
              sqlDump += '\n';
            }
            
            processedTables++;
            if (processedTables === tableNames.length) {
              fs.writeFileSync(backupPath, sqlDump);
              const stats = fs.statSync(backupPath);
              console.log(`✅ SQL dump backup created: ${backupPath}`);
              console.log(`📂 Size: ${(stats.size / 1024).toFixed(2)} KB`);
              
              db.close();
              resolve(backupPath);
            }
          });
        });
      });
    });
  }

  /**
   * Restore from database file backup
   */
  async restoreFromDatabaseFile(backupPath) {
    try {
      console.log(`🔄 Restoring from database backup: ${backupPath}`);
      
      // Create a backup of current database before restore
      const currentBackupPath = `${this.dbPath}.before-restore-${Date.now()}.db`;
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, currentBackupPath);
        console.log(`💾 Current database backed up to: ${currentBackupPath}`);
      }
      
      // Restore the backup
      fs.copyFileSync(backupPath, this.dbPath);
      console.log('✅ Database restored successfully!');
      
    } catch (error) {
      console.error('❌ Error restoring database:', error);
      throw error;
    }
  }

  /**
   * List all available backups
   */
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.db') || file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.mtime
          };
        })
        .sort((a, b) => b.created - a.created);
      
      console.log('\n📋 Available Backups:');
      console.log('====================');
      
      files.forEach((file, index) => {
        const sizeKB = (file.size / 1024).toFixed(2);
        const type = file.name.endsWith('.db') ? 'Database' : 'SQL Dump';
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Type: ${type} | Size: ${sizeKB} KB | Created: ${file.created.toLocaleString()}`);
        console.log(`   Path: ${file.path}`);
        console.log('');
      });
      
      return files;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * Clean old backups (keep only the last N backups)
   */
  cleanOldBackups(keepCount = 10) {
    try {
      const backups = this.listBackups()
        .filter(file => !file.name.startsWith('latest-')) // Don't delete latest backup
        .slice(keepCount); // Get backups to delete (after keeping the first N)
      
      if (backups.length === 0) {
        console.log('✅ No old backups to clean');
        return;
      }
      
      console.log(`🧹 Cleaning ${backups.length} old backups...`);
      
      backups.forEach(backup => {
        fs.unlinkSync(backup.path);
        console.log(`🗑️  Deleted: ${backup.name}`);
      });
      
      console.log('✅ Backup cleanup completed');
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }
}

// Export the class and provide CLI usage
module.exports = DatabaseBackupManager;

// CLI usage if run directly
if (require.main === module) {
  const backup = new DatabaseBackupManager();
  
  const command = process.argv[2];
  const arg = process.argv[3];
  
  (async () => {
    try {
      switch (command) {
        case 'create':
        case 'backup':
          await backup.createDatabaseFileBackup();
          break;
          
        case 'vacuum':
          await backup.createVacuumBackup();
          break;
          
        case 'sql':
          await backup.createSQLDumpBackup();
          break;
          
        case 'restore':
          if (!arg) {
            console.log('❌ Please specify backup file path');
            console.log('Usage: node backup-db.js restore <backup-file-path>');
            return;
          }
          await backup.restoreFromDatabaseFile(arg);
          break;
          
        case 'list':
          backup.listBackups();
          break;
          
        case 'clean':
          const keepCount = arg ? parseInt(arg) : 10;
          backup.cleanOldBackups(keepCount);
          break;
          
        case 'all':
          console.log('🚀 Creating all types of backups...\n');
          await backup.createDatabaseFileBackup();
          console.log('');
          await backup.createVacuumBackup();
          console.log('');
          await backup.createSQLDumpBackup();
          break;
          
        default:
          console.log('🔧 SQLite Database Backup Manager');
          console.log('=================================');
          console.log('');
          console.log('Commands:');
          console.log('  backup/create  - Create database file backup (.db)');
          console.log('  vacuum         - Create optimized VACUUM backup');
          console.log('  sql            - Create SQL dump backup (.sql)');
          console.log('  all            - Create all backup types');
          console.log('  restore <file> - Restore from backup file');
          console.log('  list           - List all available backups');
          console.log('  clean [keep]   - Clean old backups (keep last 10)');
          console.log('');
          console.log('Examples:');
          console.log('  node backup-db.js backup');
          console.log('  node backup-db.js restore ./database-backups/latest-backup.db');
          console.log('  node backup-db.js clean 5');
      }
    } catch (error) {
      console.error('❌ Operation failed:', error);
      process.exit(1);
    }
  })();
}
