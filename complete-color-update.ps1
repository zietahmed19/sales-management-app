# Complete Color Update Script
$componentPath = "src\components"

# Get all JSX files
$jsxFiles = Get-ChildItem -Path $componentPath -Recurse -Filter "*.jsx"

Write-Host "Starting complete color update for $($jsxFiles.Count) JSX files..."

$totalReplacements = 0

foreach ($file in $jsxFiles) {
    Write-Host "Updating: $($file.Name)"
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace all blue variants with purple
    $content = $content -replace 'bg-blue-50', 'bg-purple-50'
    $content = $content -replace 'bg-blue-100', 'bg-purple-100'
    $content = $content -replace 'bg-blue-200', 'bg-purple-200'
    $content = $content -replace 'bg-blue-300', 'bg-purple-300'
    $content = $content -replace 'bg-blue-400', 'bg-purple-400'
    $content = $content -replace 'bg-blue-500', 'bg-purple-500'
    $content = $content -replace 'bg-blue-600', 'bg-purple-600'
    $content = $content -replace 'bg-blue-700', 'bg-purple-700'
    $content = $content -replace 'bg-blue-800', 'bg-purple-800'
    $content = $content -replace 'bg-blue-900', 'bg-purple-900'
    
    # Replace hover blue with purple
    $content = $content -replace 'hover:bg-blue-50', 'hover:bg-purple-50'
    $content = $content -replace 'hover:bg-blue-100', 'hover:bg-purple-100'
    $content = $content -replace 'hover:bg-blue-200', 'hover:bg-purple-200'
    $content = $content -replace 'hover:bg-blue-300', 'hover:bg-purple-300'
    $content = $content -replace 'hover:bg-blue-400', 'hover:bg-purple-400'
    $content = $content -replace 'hover:bg-blue-500', 'hover:bg-purple-500'
    $content = $content -replace 'hover:bg-blue-600', 'hover:bg-purple-600'
    $content = $content -replace 'hover:bg-blue-700', 'hover:bg-purple-700'
    $content = $content -replace 'hover:bg-blue-800', 'hover:bg-purple-800'
    $content = $content -replace 'hover:bg-blue-900', 'hover:bg-purple-900'
    
    # Replace text blue with purple
    $content = $content -replace 'text-blue-50', 'text-purple-50'
    $content = $content -replace 'text-blue-100', 'text-purple-100'
    $content = $content -replace 'text-blue-200', 'text-purple-200'
    $content = $content -replace 'text-blue-300', 'text-purple-300'
    $content = $content -replace 'text-blue-400', 'text-purple-400'
    $content = $content -replace 'text-blue-500', 'text-purple-500'
    $content = $content -replace 'text-blue-600', 'text-purple-600'
    $content = $content -replace 'text-blue-700', 'text-purple-700'
    $content = $content -replace 'text-blue-800', 'text-purple-800'
    $content = $content -replace 'text-blue-900', 'text-purple-900'
    
    # Replace hover text blue with purple
    $content = $content -replace 'hover:text-blue-50', 'hover:text-purple-50'
    $content = $content -replace 'hover:text-blue-100', 'hover:text-purple-100'
    $content = $content -replace 'hover:text-blue-200', 'hover:text-purple-200'
    $content = $content -replace 'hover:text-blue-300', 'hover:text-purple-300'
    $content = $content -replace 'hover:text-blue-400', 'hover:text-purple-400'
    $content = $content -replace 'hover:text-blue-500', 'hover:text-purple-500'
    $content = $content -replace 'hover:text-blue-600', 'hover:text-purple-600'
    $content = $content -replace 'hover:text-blue-700', 'hover:text-purple-700'
    $content = $content -replace 'hover:text-blue-800', 'hover:text-purple-800'
    $content = $content -replace 'hover:text-blue-900', 'hover:text-purple-900'
    
    # Replace ring colors
    $content = $content -replace 'ring-blue-300', 'ring-purple-300'
    $content = $content -replace 'ring-blue-500', 'ring-purple-500'
    $content = $content -replace 'focus:ring-blue-300', 'focus:ring-purple-300'
    $content = $content -replace 'focus:ring-blue-500', 'focus:ring-purple-500'
    $content = $content -replace 'peer-focus:ring-blue-300', 'peer-focus:ring-purple-300'
    $content = $content -replace 'peer-checked:bg-blue-600', 'peer-checked:bg-purple-600'
    
    # Replace border colors
    $content = $content -replace 'border-blue-300', 'border-purple-300'
    $content = $content -replace 'border-blue-500', 'border-purple-500'
    $content = $content -replace 'focus:border-blue-500', 'focus:border-purple-500'
    
    # Replace indigo colors that might have been missed
    $content = $content -replace 'hover:bg-indigo-50', 'hover:bg-purple-50'
    $content = $content -replace 'hover:bg-indigo-100', 'hover:bg-purple-100'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated $($file.Name)"
        $totalReplacements++
    }
}

Write-Host "Complete color update finished! Updated $totalReplacements files."
