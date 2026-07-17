$body = @{
    email = "alex@example.com"
    password = "AdminAutocare1@"
    rememberMe = $true
    deviceId = "00000000-0000-0000-0000-000000000000"
} | ConvertTo-Json

$res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/mobile/login" -Method Post -ContentType "application/json" -Body $body
$headers = @{
    Authorization = "Bearer " + $res.accessToken
}

Write-Host "Fetching /api/v1/brands..."
$brands = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/brands" -Method Get -Headers $headers
$brands | ConvertTo-Json -Depth 4
