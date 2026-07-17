$loginBody = @{
    email = "alex@example.com"
    password = "AdminAutocare1@"
    rememberMe = $true
    deviceId = "00000000-0000-0000-0000-000000000001"
} | ConvertTo-Json

Write-Host "Logging in as alex@example.com..."
$loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/mobile/login" -Method Post -ContentType "application/json" -Body $loginBody
$accessToken = $loginRes.accessToken
Write-Host "Successfully logged in! Token acquired."

$headers = @{
    Authorization = "Bearer " + $accessToken
}

$jobBody = @{
    type = "DIGITAL_TWIN_GENERATION"
    payload = @{
        brandId = "79153fdc-8a4e-4b7f-ac50-0bd8a3682a45" # Mercedes-Benz
        modelId = "436b4d42-aa25-42f6-bba0-eefc51850df5" # Citan
        year = 2028
        purchaseCondition = "USED"
        currentMileage = 20000
        fuelType = "DIESEL"
        transmission = "AUTOMATIC"
        trimConfiguration = "AMG Line"
        mileageUnit = "KM"
        primary = $false
    }
} | ConvertTo-Json

Write-Host "Submitting vehicle onboarding job..."
$jobRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/jobs" -Method Post -ContentType "application/json" -Headers $headers -Body $jobBody
$jobId = $jobRes.id
Write-Host "Job submitted! ID: $jobId"

Write-Host "Polling job status..."
$attempts = 0
$maxAttempts = 30
$completed = $false

while ($attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempts++
    
    try {
        $statusRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/jobs/$jobId" -Method Get -Headers $headers
        Write-Host "Attempt ${attempts} - Status = $($statusRes.status), Stage = $($statusRes.currentStage)"
        
        if ($statusRes.status -eq "COMPLETED") {
            Write-Host "Job COMPLETED successfully!"
            Write-Host "Result payload:"
            $statusRes.result | ConvertTo-Json -Depth 4
            $completed = $true
            break
        } elseif ($statusRes.status -eq "FAILED") {
            Write-Host "Job FAILED!"
            Write-Host "Error message: $($statusRes.errorMessage)"
            break
        }
    } catch {
        Write-Error "Error calling job status endpoint: $_"
    }
}

if ($completed) {
    Write-Host "Fetching user's vehicles..."
    $vehicles = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/vehicles" -Method Get -Headers $headers
    Write-Host "User's vehicles:"
    $vehicles | ConvertTo-Json -Depth 4
} else {
    Write-Host "Job did not complete successfully or timed out."
}
