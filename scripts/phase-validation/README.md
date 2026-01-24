# HDAS Phase-4 Schema Validation Runner

Validates additive schema presence required for Hibernate `ddl-auto=validate` without destructive changes.

## Setup

1. Install dependencies:
```bash
cd scripts/phase-validation
npm install
```

2. Set MySQL connection environment variables:
- `MYSQL_HOST` (default: `localhost`)
- `MYSQL_PORT` (default: `3306`)
- `MYSQL_USER` (default: `root`) 
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE` (e.g., `hdas`)

## Run
```bash
npm run validate
```

Exit code:
- `0`: All required tables/columns/indexes present (ready for `validate`).
- `1`: Missing required structures (apply `MIGRATION_PHASE_4.sql`).
- `2`: Script error.

## What it checks
- Required shadow tables: `role_permissions_text`, `escalation_history`, `slas_new`, `delegations_new`, `delay_debt_scores`
- Required additive columns and types (e.g., `BINARY(16)` for UUID, `JSON`, `BOOLEAN`, `TIMESTAMP`)
- Required unique indexes: `users.email`, `users.username`, `roles.name`

Adjust `config.json` if JPA mappings change.

## Apply Phase-4 SQL (PowerShell)

Requires MySQL client in PATH and env vars set.

```powershell
# Windows PowerShell
$env:MYSQL_HOST = "localhost"
$env:MYSQL_PORT = "3306"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "yourpassword"
$env:MYSQL_DATABASE = "hdas"

# Apply additive SQL and validate
pwsh ./apply-phase-4.ps1
```

Order of operations in script:
- Applies `MIGRATION_PHASE_4.sql` (additive only).
- Runs `npm run validate` to confirm schema readiness.
