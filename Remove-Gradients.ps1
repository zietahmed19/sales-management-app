# PowerShell Script to Remove Gradients and Use Simple Purple/White Colors
Write-Host "🎨 Removing gradients and switching to simple purple/white colors..." -ForegroundColor Magenta

# Get all JSX files
$jsxFiles = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse

$replacements = @{
    # Background gradients to simple colors
    'bg-gradient-to-br from-white to-purple-50' = 'bg-white'
    'bg-gradient-to-br from-purple-50 to-white' = 'bg-white'
    'bg-gradient-to-br from-white to-gray-100' = 'bg-gray-50'
    'bg-gradient-black-to-purple' = 'bg-white'
    
    # Header gradients to simple purple
    'bg-gradient-to-r from-purple-600 via-purple-500 to-white0' = 'bg-purple-600'
    'bg-gradient-to-r from-purple-600 to-white0' = 'bg-purple-600'
    
    # Button gradients - main buttons
    'bg-gradient-to-r from-purple-600 to-purple-800' = 'bg-purple-600'
    'bg-gradient-to-r from-purple-500 to-purple-700' = 'bg-purple-600'
    'bg-gradient-to-r from-purple-500 to-purple-600' = 'bg-purple-600'
    'bg-gradient-to-r from-purple-400 to-purple-600' = 'bg-purple-500'
    'bg-gradient-to-br from-purple-500 to-purple-700' = 'bg-purple-600'
    
    # Hover states for buttons
    'hover:from-purple-700 hover:to-purple-900' = 'hover:bg-purple-700'
    'hover:from-purple-600 hover:to-purple-800' = 'hover:bg-purple-700'
    'hover:from-purple-600 hover:to-purple-700' = 'hover:bg-purple-700'
    'hover:from-purple-500 hover:to-purple-700' = 'hover:bg-purple-600'
    'hover:from-purple-700 hover:to-purple-600' = 'hover:bg-purple-700'
}

foreach ($file in $jsxFiles) {
    Write-Host "🔄 Processing: $($file.Name)" -ForegroundColor Cyan
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($pattern in $replacements.Keys) {
        $replacement = $replacements[$pattern]
        if ($content -match [regex]::Escape($pattern)) {
            $content = $content -replace [regex]::Escape($pattern), $replacement
            Write-Host "   ✅ Replaced: $pattern → $replacement" -ForegroundColor Green
        }
    }
    
    # Save the file if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "   💾 Updated: $($file.Name)" -ForegroundColor Yellow
    } else {
        Write-Host "   ➡️ No changes needed" -ForegroundColor Gray
    }
}

Write-Host "✨ Gradient removal complete! Your app now uses simple purple and white colors." -ForegroundColor Green
