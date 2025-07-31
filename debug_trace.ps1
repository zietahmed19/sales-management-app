# Debug trace script to test the exact API flow that the frontend uses
Write-Host "🔄 Step 1: Testing login API..." -ForegroundColor Yellow

try {
    # Step 1: Login
    $loginBody = @{
        username = "ahmed"
        password = "123456"
    } | ConvertTo-Json

    Write-Host "🔐 Sending login request..." -ForegroundColor Cyan
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "🔑 Token received: $($loginResponse.token -ne $null)" -ForegroundColor Green
    Write-Host "👤 User received: $($loginResponse.user.username)" -ForegroundColor Green
    Write-Host "🔑 Token preview: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor Green
    
    # Step 2: Test API calls with the token (exactly as frontend does)
    Write-Host "`n🔄 Step 2: Testing API calls with token..." -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $($loginResponse.token)"
    }
    
    Write-Host "📡 Headers being sent: Authorization Bearer [token]" -ForegroundColor Cyan
    
    # Test clients endpoint
    Write-Host "`n🧪 Testing clients endpoint..." -ForegroundColor Cyan
    $clientsData = Invoke-RestMethod -Uri "http://localhost:3001/api/clients" -Headers $headers -Method GET
    Write-Host "📊 Clients count: $($clientsData.Count)" -ForegroundColor Green
    Write-Host "📊 First client: $($clientsData[0].FullName)" -ForegroundColor Green
    
    # Test packs endpoint
    Write-Host "`n🧪 Testing packs endpoint..." -ForegroundColor Cyan
    $packsData = Invoke-RestMethod -Uri "http://localhost:3001/api/packs" -Headers $headers -Method GET
    Write-Host "📋 Packs count: $($packsData.Count)" -ForegroundColor Green
    Write-Host "📋 First pack: $($packsData[0].pack_name)" -ForegroundColor Green
    
    Write-Host "`n✅ All API tests completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ Error details: $($_.Exception)" -ForegroundColor Red
}
