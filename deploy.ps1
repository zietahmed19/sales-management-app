# PowerShell deployment script for Windows
Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if database exists
if (Test-Path "sales_management.db") {
    Write-Host "📊 Database found, creating backup..." -ForegroundColor Yellow
    
    # Create backup using Node.js
    $backupScript = @"
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
"@

    $backupScript | Out-File -FilePath "temp-backup-script.js" -Encoding UTF8
    $result = node "temp-backup-script.js"
    Remove-Item "temp-backup-script.js" -Force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Backup failed! Aborting deployment." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️ No database file found, skipping backup" -ForegroundColor Yellow
}

# Add all files to git
Write-Host "📝 Adding files to git..." -ForegroundColor Cyan
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
if ($args[0]) {
    git commit -m $args[0]
} else {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto-deploy: $timestamp"
}

# Push to main branch
Write-Host "🚀 Pushing to production..." -ForegroundColor Green
git push origin main

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Wait for deployment to complete"
Write-Host "2. Check production logs"
Write-Host "3. Test sales functionality"
Write-Host "4. If needed, use admin panel to restore backup"
