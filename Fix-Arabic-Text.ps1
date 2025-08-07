# PowerShell Script to Fix Arabic Text Encoding Issues
Write-Host "🔧 Fixing Arabic text encoding issues..." -ForegroundColor Cyan

# Define Arabic text replacements
$arabicFixes = @{
    'Ø¯Ø®ÙˆÙ„ Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨' = 'دخول المندوب'
    'Ø¯Ø®ÙˆÙ„ Ø§Ù„Ù…Ø¯ÙŠØ±' = 'دخول المدير'
    'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø¯ÙŠØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©' = 'بيانات اعتماد المدير غير صحيحة'
    'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ ØºÙŠØ± ØµØ­ÙŠØ­Ø©' = 'بيانات الاعتماد غير صحيحة'
    'mohcenacid' = 'mohcenacid'
    'admin1234' = 'admin1234'
    'Ø¬Ø§Ø±ÙŠ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„...' = 'جاري تسجيل الدخول...'
    'Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø¯ÙŠØ±' = 'دخول كمدير'
    'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¯ÙŠØ±ÙŠÙ†:' = 'بيانات المديرين:'
    'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨ÙŠÙ† Ù…Ø­ÙÙˆØ¸Ø© ÙÙŠØ§ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª' = 'بيانات المندوبين محفوظة في قاعدة البيانات'
    'Ø§Ø³ØªØ®Ø¯Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ø¹ØªÙ…Ø§Ø¯Ùƒ Ø§Ù„Ø­Ø¼ÙŠÙ‚ÙŠØ©' = 'استخدم بيانات اعتمادك الحقيقية'
}

# Get all JSX files
$jsxFiles = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse

foreach ($file in $jsxFiles) {
    Write-Host "🔄 Processing: $($file.Name)" -ForegroundColor Yellow
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $changesMade = 0
    
    foreach ($pattern in $arabicFixes.Keys) {
        $replacement = $arabicFixes[$pattern]
        if ($content -like "*$pattern*") {
            $content = $content.Replace($pattern, $replacement)
            Write-Host "   ✅ Fixed: $pattern → $replacement" -ForegroundColor Green
            $changesMade++
        }
    }
    
    # Save the file if changes were made
    if ($changesMade -gt 0) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "   💾 Updated: $($file.Name) ($changesMade fixes)" -ForegroundColor Cyan
    } else {
        Write-Host "   ➡️ No Arabic encoding issues found" -ForegroundColor Gray
    }
}

Write-Host "✨ Arabic text encoding fixes complete!" -ForegroundColor Green
