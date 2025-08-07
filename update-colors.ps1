# Purple & White Theme Color Update Script

$componentPath = "src\components"

# Define color mappings from blue/indigo to purple
$colorMappings = @{
    "bg-blue-50" = "bg-purple-50"
    "bg-blue-100" = "bg-purple-100"
    "bg-blue-200" = "bg-purple-200"
    "bg-blue-300" = "bg-purple-300"
    "bg-blue-400" = "bg-purple-400"
    "bg-blue-500" = "bg-purple-500"
    "bg-blue-600" = "bg-purple-600"
    "bg-blue-700" = "bg-purple-700"
    "bg-blue-800" = "bg-purple-800"
    "bg-blue-900" = "bg-purple-900"
    
    "bg-indigo-50" = "bg-purple-50"
    "bg-indigo-100" = "bg-purple-100"
    "bg-indigo-200" = "bg-purple-200"
    "bg-indigo-300" = "bg-purple-300"
    "bg-indigo-400" = "bg-purple-400"
    "bg-indigo-500" = "bg-purple-500"
    "bg-indigo-600" = "bg-purple-600"
    "bg-indigo-700" = "bg-purple-700"
    "bg-indigo-800" = "bg-purple-800"
    "bg-indigo-900" = "bg-purple-900"
    
    "text-blue-50" = "text-purple-50"
    "text-blue-100" = "text-purple-100"
    "text-blue-200" = "text-purple-200"
    "text-blue-300" = "text-purple-300"
    "text-blue-400" = "text-purple-400"
    "text-blue-500" = "text-purple-500"
    "text-blue-600" = "text-purple-600"
    "text-blue-700" = "text-purple-700"
    "text-blue-800" = "text-purple-800"
    "text-blue-900" = "text-purple-900"
    
    "text-indigo-50" = "text-purple-50"
    "text-indigo-100" = "text-purple-100"
    "text-indigo-200" = "text-purple-200"
    "text-indigo-300" = "text-purple-300"
    "text-indigo-400" = "text-purple-400"
    "text-indigo-500" = "text-purple-500"
    "text-indigo-600" = "text-purple-600"
    "text-indigo-700" = "text-purple-700"
    "text-indigo-800" = "text-purple-800"
    "text-indigo-900" = "text-purple-900"
    
    "border-blue-200" = "border-purple-200"
    "border-blue-300" = "border-purple-300"
    "border-blue-400" = "border-purple-400"
    "border-blue-500" = "border-purple-500"
    "border-blue-600" = "border-purple-600"
    
    "border-indigo-300" = "border-purple-300"
    "border-indigo-500" = "border-purple-500"
    "border-indigo-600" = "border-purple-600"
    
    "hover:bg-blue-50" = "hover:bg-purple-50"
    "hover:bg-blue-100" = "hover:bg-purple-100"
    "hover:bg-blue-600" = "hover:bg-purple-600"
    "hover:bg-blue-700" = "hover:bg-purple-700"
    "hover:bg-blue-800" = "hover:bg-purple-800"
    
    "hover:bg-indigo-50" = "hover:bg-purple-50"
    "hover:bg-indigo-600" = "hover:bg-purple-600"
    "hover:bg-indigo-700" = "hover:bg-purple-700"
    "hover:bg-indigo-800" = "hover:bg-purple-800"
    
    "hover:text-blue-600" = "hover:text-purple-600"
    "hover:text-blue-700" = "hover:text-purple-700"
    "hover:text-blue-800" = "hover:text-purple-800"
    "hover:text-blue-900" = "hover:text-purple-900"
    
    "hover:text-indigo-600" = "hover:text-purple-600"
    "hover:text-indigo-700" = "hover:text-purple-700"
    "hover:text-indigo-800" = "hover:text-purple-800"
    "hover:text-indigo-900" = "hover:text-purple-900"
    
    "focus:ring-blue-300" = "focus:ring-purple-300"
    "focus:ring-blue-500" = "focus:ring-purple-500"
    "focus:ring-indigo-500" = "focus:ring-purple-500"
    "focus:border-indigo-500" = "focus:border-purple-500"
    
    "peer-checked:bg-blue-600" = "peer-checked:bg-purple-600"
}

# Get all JSX files
$jsxFiles = Get-ChildItem -Path $componentPath -Recurse -Filter "*.jsx"

Write-Host "🎨 Starting Purple and White Theme Color Update..." -ForegroundColor Magenta
Write-Host "Found $($jsxFiles.Count) JSX files to update" -ForegroundColor Cyan

$totalReplacements = 0

foreach ($file in $jsxFiles) {
    Write-Host "📝 Updating: $($file.Name)" -ForegroundColor Yellow
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Apply all color mappings
    foreach ($oldColor in $colorMappings.Keys) {
        $newColor = $colorMappings[$oldColor]
        $replacements = [regex]::Matches($content, [regex]::Escape($oldColor)).Count
        if ($replacements -gt 0) {
            $content = $content -replace [regex]::Escape($oldColor), $newColor
            $totalReplacements += $replacements
            Write-Host "  ✅ $oldColor → $newColor ($replacements replacements)" -ForegroundColor Green
        }
    }
    
    # Save only if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  💾 Saved changes to $($file.Name)" -ForegroundColor Blue
    }
}

Write-Host ""
Write-Host "🎉 Purple and White Theme Update Complete!" -ForegroundColor Magenta
Write-Host "✨ Total replacements made: $totalReplacements" -ForegroundColor Cyan
Write-Host "🎨 All components now use Purple and White theme!" -ForegroundColor Magenta
