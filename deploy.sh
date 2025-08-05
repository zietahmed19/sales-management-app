#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if database exists
if [ -f "sales_management.db" ]; then
    echo "📊 Database found, creating backup..."
    
    # Create backup using Node.js
    node -e "
    const DatabaseBackup = require('./database-backup');
    const path = require('path');
    
    const dbPath = path.join(__dirname, 'sales_management.db');
    const dbBackup = new DatabaseBackup(dbPath);
    
    (async () => {
        try {
            console.log('🔄 Creating pre-deployment backup...');
            const result = await dbBackup.createDeploymentBackup();
            console.log('✅ Backup created successfully!');
            console.log('📁 Backup saved to:', result.filepath);
            
            // Also output some stats
            const stats = dbBackup.getBackupStats();
            console.log('📈 Total backups available:', stats.length);
            
            process.exit(0);
        } catch (error) {
            console.error('❌ Backup failed:', error);
            process.exit(1);
        }
    })();
    "
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup completed successfully"
    else
        echo "❌ Backup failed! Aborting deployment."
        exit 1
    fi
else
    echo "⚠️ No database file found, skipping backup"
fi

# Add all files to git
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
if [ -n "$1" ]; then
    git commit -m "$1"
else
    git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push to main branch
echo "🚀 Pushing to production..."
git push origin main

echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for deployment to complete"
echo "2. Check production logs"
echo "3. Test sales functionality"
echo "4. If needed, use admin panel to restore backup"
