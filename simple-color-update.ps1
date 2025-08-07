# Simple Color Update Script
$componentPath = "src\components"

# Get all JSX files
$jsxFiles = Get-ChildItem -Path $componentPath -Recurse -Filter "*.jsx"

Write-Host "Starting color update for $($jsxFiles.Count) JSX files..."

$totalReplacements = 0

foreach ($file in $jsxFiles) {
    Write-Host "Updating: $($file.Name)"
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace indigo with purple
    $content = $content -replace 'bg-indigo-600', 'bg-purple-600'
    $content = $content -replace 'bg-indigo-700', 'bg-purple-700'
    $content = $content -replace 'bg-indigo-500', 'bg-purple-500'
    $content = $content -replace 'hover:bg-indigo-700', 'hover:bg-purple-700'
    $content = $content -replace 'hover:bg-indigo-600', 'hover:bg-purple-600'
    $content = $content -replace 'text-indigo-600', 'text-purple-600'
    $content = $content -replace 'text-indigo-700', 'text-purple-700'
    $content = $content -replace 'text-indigo-800', 'text-purple-800'
    $content = $content -replace 'hover:text-indigo-600', 'hover:text-purple-600'
    $content = $content -replace 'hover:text-indigo-700', 'hover:text-purple-700'
    $content = $content -replace 'hover:text-indigo-800', 'hover:text-purple-800'
    $content = $content -replace 'focus:ring-indigo-500', 'focus:ring-purple-500'
    $content = $content -replace 'focus:border-indigo-500', 'focus:border-purple-500'
    
    # Replace blue with purple
    $content = $content -replace 'bg-blue-50', 'bg-purple-50'
    $content = $content -replace 'bg-blue-100', 'bg-purple-100'
    $content = $content -replace 'bg-blue-500', 'bg-purple-500'
    $content = $content -replace 'bg-blue-600', 'bg-purple-600'
    $content = $content -replace 'bg-blue-700', 'bg-purple-700'
    $content = $content -replace 'hover:bg-blue-600', 'hover:bg-purple-600'
    $content = $content -replace 'hover:bg-blue-700', 'hover:bg-purple-700'
    $content = $content -replace 'hover:bg-blue-50', 'hover:bg-purple-50'
    $content = $content -replace 'text-blue-600', 'text-purple-600'
    $content = $content -replace 'text-blue-800', 'text-purple-800'
    $content = $content -replace 'text-blue-900', 'text-purple-900'
    $content = $content -replace 'hover:text-blue-600', 'hover:text-purple-600'
    $content = $content -replace 'hover:text-blue-700', 'hover:text-purple-700'
    $content = $content -replace 'hover:text-blue-800', 'hover:text-purple-800'
    $content = $content -replace 'hover:text-blue-900', 'hover:text-purple-900'
    $content = $content -replace 'peer-checked:bg-blue-600', 'peer-checked:bg-purple-600'
    $content = $content -replace 'focus:ring-blue-300', 'focus:ring-purple-300'
    $content = $content -replace 'focus:ring-blue-500', 'focus:ring-purple-500'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated $($file.Name)"
        $totalReplacements++
    }
}

Write-Host "Color update complete! Updated $totalReplacements files."
