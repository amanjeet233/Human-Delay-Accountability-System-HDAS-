param(
    [string]$HostName = "localhost",
    [string]$User = "root",
    [string]$Password,
    [string]$Database = "hdas",
    [string]$SqlFile = "master-data-seed.sql",
    [string]$MysqlPath = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe",
    [string]$LogDir = "backend/logs"
)

Write-Host "== HDAS Master Data Seed Runner ==" -ForegroundColor Cyan

# Resolve credentials (env vars take precedence if param not provided)
if (-not $User -or $User.Trim().Length -eq 0) { $User = "root" }
if (-not $Password -or $Password.Trim().Length -eq 0) {
    if ($env:HDAS_DB_PASS -and $env:HDAS_DB_PASS.Trim().Length -gt 0) {
        $Password = $env:HDAS_DB_PASS
    } else {
        # Fallback default as requested; can be overridden via param or env
        $Password = "Amanjet@4321."
        Write-Host "[Warn] Using default password fallback. Consider setting HDAS_DB_PASS env var." -ForegroundColor Yellow
    }
}
if ($env:HDAS_DB_USER -and $env:HDAS_DB_USER.Trim().Length -gt 0) { $User = $env:HDAS_DB_USER }

# Validate MySQL client
$mysqlCmd = Get-Command $MysqlPath -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    Write-Error "MySQL client not found at: $MysqlPath"
    exit 1
}

# Resolve paths
$workspace = Get-Location
$sqlPath = Join-Path $workspace $SqlFile
if (-not (Test-Path $sqlPath)) {
    Write-Error "Seed SQL file not found: $sqlPath"
    exit 1
}

$logDirPath = Join-Path $workspace $LogDir
if (-not (Test-Path $logDirPath)) {
    New-Item -ItemType Directory -Path $logDirPath | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $logDirPath ("master-data-seed-" + $timestamp + ".log")

Write-Host "MySQL: $MysqlPath" -ForegroundColor DarkGray
Write-Host "DB: $Database@$HostName" -ForegroundColor DarkGray
Write-Host "User: $User" -ForegroundColor DarkGray
Write-Host "SQL: $sqlPath" -ForegroundColor DarkGray
Write-Host "Log: $logFile" -ForegroundColor DarkGray

# Execute with piping to avoid redirection quirks in PowerShell
try {
    $output = Get-Content -Raw $sqlPath |
        & $MysqlPath -h $HostName -u $User -p"$Password" $Database 2>&1
    $output | Tee-Object -FilePath $logFile | Out-Host
}
catch {
    Write-Error "Seed execution failed: $_"
    exit 1
}

# Simple summary parsing
$missingPre = ([regex]::Matches($output, 'Pre-Check:.*MISSING')).Count
$presentPost = ([regex]::Matches($output, 'Post-Check:.*PRESENT')).Count

Write-Host "== Summary ==" -ForegroundColor Cyan
Write-Host ("Pre-Check: MISSING entries -> {0}" -f $missingPre)
Write-Host ("Post-Check: PRESENT entries -> {0}" -f $presentPost)
Write-Host "Report saved: $logFile" -ForegroundColor Green

exit 0
