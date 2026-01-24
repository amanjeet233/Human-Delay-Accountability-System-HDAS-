# Requires MySQL client installed and available in PATH
# Applies additive Phase-4 SQL and runs validation

param(
    [string]$SqlPath = "../../MIGRATION_PHASE_4.sql"
)

$ErrorActionPreference = 'Stop'

function Require-EnvVar([string]$name) {
    if (-not $env:$name -or $env:$name -eq '') {
        Write-Error "Environment variable '$name' is required."
    }
}

Write-Host "HDAS Phase-4 Apply: Starting additive SQL apply..." -ForegroundColor Cyan

Require-EnvVar 'MYSQL_HOST'
Require-EnvVar 'MYSQL_PORT'
Require-EnvVar 'MYSQL_USER'
Require-EnvVar 'MYSQL_PASSWORD'
Require-EnvVar 'MYSQL_DATABASE'

$resolvedSql = Resolve-Path -Path $SqlPath
if (-not (Test-Path $resolvedSql)) {
    Write-Error "SQL file not found: $resolvedSql"
}

# Apply SQL using MySQL client
$mysqlArgs = @(
    "--host=$env:MYSQL_HOST",
    "--port=$env:MYSQL_PORT",
    "--user=$env:MYSQL_USER",
    "--password=$env:MYSQL_PASSWORD",
    $env:MYSQL_DATABASE,
    "--table"
)

Write-Host "Applying SQL: $resolvedSql" -ForegroundColor Yellow
# Use Get-Content to pass SQL to mysql
Get-Content -Path $resolvedSql | & mysql @mysqlArgs

Write-Host "SQL apply completed. Running schema validation..." -ForegroundColor Cyan

Push-Location (Resolve-Path -Path ".")
try {
    Set-Location "$PSScriptRoot"
    Set-Location "./"
    # Run npm validation
    if (Test-Path "package.json") {
        npm run validate
    } else {
        Write-Warning "package.json not found in $PSScriptRoot; ensure you're in scripts/phase-validation directory to run validation."
    }
} finally {
    Pop-Location
}

Write-Host "Done." -ForegroundColor Green
