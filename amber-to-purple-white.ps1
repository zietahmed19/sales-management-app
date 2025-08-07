# Replace Amber Colors with White and Purple
$componentPath = "src"

# Get all JSX and CSS files
$files = Get-ChildItem -Path $componentPath -Recurse -Include "*.jsx", "*.css"

Write-Host "Starting amber color replacement for $($files.Count) files..."

$totalReplacements = 0

foreach ($file in $files) {
    Write-Host "Checking: $($file.Name)"
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace amber background gradients with white and purple
    $content = $content -replace 'to-amber-50', 'to-white'
    $content = $content -replace 'to-amber-500', 'to-purple-500'
    $content = $content -replace 'to-amber-600', 'to-purple-600'
    $content = $content -replace 'to-amber-700', 'to-purple-700'
    
    # Replace amber in gradients
    $content = $content -replace 'from-amber-500', 'from-purple-500'
    $content = $content -replace 'from-amber-600', 'from-purple-600'
    $content = $content -replace 'from-amber-700', 'from-purple-700'
    $content = $content -replace 'via-amber-500', 'via-purple-500'
    
    # Replace hover amber gradients
    $content = $content -replace 'hover:to-amber-500', 'hover:to-purple-500'
    $content = $content -replace 'hover:to-amber-600', 'hover:to-purple-600'
    $content = $content -replace 'hover:to-amber-700', 'hover:to-purple-700'
    $content = $content -replace 'hover:from-amber-600', 'hover:from-purple-600'
    $content = $content -replace 'hover:from-amber-700', 'hover:from-purple-700'
    
    # Replace solid amber backgrounds
    $content = $content -replace 'bg-amber-500', 'bg-purple-500'
    $content = $content -replace 'bg-amber-600', 'bg-purple-600'
    $content = $content -replace 'bg-amber-700', 'bg-purple-700'
    $content = $content -replace 'bg-amber-800', 'bg-purple-800'
    
    # Replace hover amber backgrounds
    $content = $content -replace 'hover:bg-amber-600', 'hover:bg-purple-600'
    $content = $content -replace 'hover:bg-amber-700', 'hover:bg-purple-700'
    $content = $content -replace 'hover:bg-amber-800', 'hover:bg-purple-800'
    
    # Replace amber text colors
    $content = $content -replace 'text-amber-500', 'text-purple-500'
    $content = $content -replace 'text-amber-600', 'text-purple-600'
    $content = $content -replace 'text-amber-700', 'text-purple-700'
    $content = $content -replace 'text-amber-800', 'text-purple-800'
    
    # Replace hover amber text
    $content = $content -replace 'hover:text-amber-500', 'hover:text-purple-500'
    $content = $content -replace 'hover:text-amber-600', 'hover:text-purple-600'
    $content = $content -replace 'hover:text-amber-700', 'hover:text-purple-700'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated $($file.Name)"
        $totalReplacements++
    }
}

Write-Host "Amber color replacement complete! Updated $totalReplacements files."
