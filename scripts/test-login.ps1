param(
    [string]$Username = "admin",
    [string]$Password = "admin123",
    [string]$ApiBase = "http://localhost:8080"
)

$body = @{ username = $Username; password = $Password } | ConvertTo-Json
try {
    Write-Host "POST $ApiBase/api/auth/login ..."
    $resp = Invoke-WebRequest -Uri "$ApiBase/api/auth/login" -Method Post -ContentType "application/json" -Body $body -SessionVariable sess
    Write-Host "Status:" $resp.StatusCode
    Write-Host "Set-Cookie headers:"
    $resp.Headers["Set-Cookie"]
    Write-Host ""
    Write-Host "GET $ApiBase/api/auth/me ..."
    $me = Invoke-WebRequest -Uri "$ApiBase/api/auth/me" -Method Get -WebSession $sess
    $me.Content
} catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.Exception.Response -ne $null) {
        try {
            $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $respBody = $sr.ReadToEnd()
            Write-Host "Response body:" $respBody
        } catch {}
    }
    exit 1
}
