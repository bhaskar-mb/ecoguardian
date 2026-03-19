$body = @{
    status = "investigating"
    timelineEvent = @{
        status = "investigating"
        message = "Testing update from powershell"
        actor = "Manual Test"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/reports/R-902" -Method Patch -ContentType "application/json" -Body $body | ConvertTo-Json
