const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class DatabaseBackup {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.backupDir = path.join(__dirname, 'database-backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('📁 Created backup directory:', this.backupDir);
    }
  }

  // Export all data to JSON format
  async exportToJSON() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      const backup = {
        timestamp: new Date().toISOString(),
        tables: {}
      };

      const tables = ['sales', 'clients', 'representatives', 'packs', 'articles', 'gifts', 'pack_articles'];
      let completed = 0;

      tables.forEach(tableName => {
        const query = `SELECT * FROM ${tableName}`;
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error(`❌ Error backing up ${tableName}:`, err);
            backup.tables[tableName] = [];
          } else {
            backup.tables[tableName] = rows;
            console.log(`✅ Backed up ${tableName}: ${rows.length} records`);
          }
          
          completed++;
          if (completed === tables.length) {
            db.close();
            
            // Save to file
            const filename = `database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const filepath = path.join(this.backupDir, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
            console.log('💾 Database backup saved:', filepath);
            
            resolve({ backup, filepath });
          }
        });
      });
    });
  }

  // Import data from JSON backup
  async importFromJSON(backupPath) {
    return new Promise((resolve, reject) => {
      try {
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const db = new sqlite3.Database(this.dbPath);
        
        console.log('🔄 Starting database restore from:', backupPath);
        console.log('📅 Backup timestamp:', backupData.timestamp);

        // Restore sales data (most important)
        if (backupData.tables.sales && backupData.tables.sales.length > 0) {
          const salesData = backupData.tables.sales;
          let insertedSales = 0;

          salesData.forEach((sale, index) => {
            const query = `
              INSERT OR REPLACE INTO sales (id, client_id, representative_id, pack_id, total_price, sale_date)
              VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.run(query, [
              sale.id,
              sale.client_id,
              sale.representative_id,
              sale.pack_id,
              sale.total_price,
              sale.sale_date
            ], function(err) {
              if (err) {
                console.error(`❌ Error restoring sale ${sale.id}:`, err);
              } else {
                insertedSales++;
                console.log(`✅ Restored sale ${sale.id} (${insertedSales}/${salesData.length})`);
              }

              if (index === salesData.length - 1) {
                db.close();
                console.log(`🎉 Database restore completed! Restored ${insertedSales} sales`);
                resolve({ restored: insertedSales, total: salesData.length });
              }
            });
          });
        } else {
          db.close();
          console.log('ℹ️ No sales data to restore');
          resolve({ restored: 0, total: 0 });
        }
      } catch (error) {
        console.error('❌ Error importing backup:', error);
        reject(error);
      }
    });
  }

  // Create automatic backup before deployment
  async createDeploymentBackup() {
    console.log('🚀 Creating pre-deployment backup...');
    const result = await this.exportToJSON();
    
    // Also create a special "latest" backup for easy restoration
    const latestBackupPath = path.join(this.backupDir, 'latest-backup.json');
    fs.copyFileSync(result.filepath, latestBackupPath);
    console.log('📋 Latest backup saved:', latestBackupPath);
    
    return result;
  }

  // Restore from latest backup
  async restoreFromLatest() {
    const latestBackupPath = path.join(this.backupDir, 'latest-backup.json');
    
    if (fs.existsSync(latestBackupPath)) {
      console.log('🔄 Restoring from latest backup...');
      return await this.importFromJSON(latestBackupPath);
    } else {
      console.log('⚠️ No latest backup found');
      return { restored: 0, total: 0 };
    }
  }

  // Get backup statistics
  getBackupStats() {
    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(this.backupDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);

    return backupFiles;
  }
}

module.exports = DatabaseBackup;
