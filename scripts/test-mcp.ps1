# Validate MCP SSE endpoint connectivity for HDAS docs
param(
    [string]$Url = "https://gitmcp.io/amanjeet233/Human-Delay-Accountability-System-HDAS-"
)

Write-Host "Testing MCP server: $Url" -ForegroundColor Cyan

# Try HEAD first to avoid long-lived SSE stream
try {
    $head = Invoke-WebRequest -Method Head -Uri $Url -TimeoutSec 10 -ErrorAction Stop
    Write-Host "Status: $($head.StatusCode)" -ForegroundColor Green
    if ($head.StatusCode -ge 200 -and $head.StatusCode -lt 400) {
        Write-Host "MCP endpoint reachable." -ForegroundColor Green
    }
}
catch {
    Write-Warning "HEAD request failed: $($_.Exception.Message)"
}

# Fallback: short GET with timeout to inspect headers
try {
    $resp = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -ErrorAction Stop
    $ct = $resp.Headers["Content-Type"]
    Write-Host "Content-Type: $ct" -ForegroundColor Yellow
    if ($ct -and $ct -like "*text/event-stream*") {
        Write-Host "SSE stream detected. MCP server looks healthy." -ForegroundColor Green
    } else {
        Write-Host "Received non-SSE content; server still reachable." -ForegroundColor Yellow
    }
}
catch {
    Write-Error "GET request failed: $($_.Exception.Message)"
    exit 1
}

Write-Host "Done." -ForegroundColor Cyan
