@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Dev Starter (Backend + Frontend + MySQL)
REM - Starts MySQL service (Windows)
REM - Optionally imports SCHEMA_CONSOLIDATED.sql
REM - Starts Spring Boot backend (dev profile)
REM - Starts Next.js frontend (dev server)
REM =============================================================

REM Change to repo root (robust)
pushd "%~dp0.." >nul

REM ---- MySQL Service ----
set "MYSQL_SERVICE=%HDAS_MYSQL_SERVICE%"
if not defined MYSQL_SERVICE set "MYSQL_SERVICE=MySQL80"
echo [MySQL] Checking MySQL service "%MYSQL_SERVICE%" status...
sc query "%MYSQL_SERVICE%" | findstr /C:"RUNNING" >nul
if not errorlevel 1 (
  echo [MySQL] Service %MYSQL_SERVICE% is already running.
) else (
  echo [MySQL] Attempting to start service %MYSQL_SERVICE%...
  net start "%MYSQL_SERVICE%" >nul 2>&1
  sc query "%MYSQL_SERVICE%" | findstr /C:"RUNNING" >nul
  if not errorlevel 1 (
    echo [MySQL] Service started.
  ) else (
    echo [MySQL] Service %MYSQL_SERVICE% not found or failed to start. If MySQL runs manually, skip this.
  )
)

REM ---- Optional Schema Import ----
REM Set IMPORT_SCHEMA=1 to import SCHEMA_CONSOLIDATED.sql using DB_USER/DB_PASS or env HDAS_DB_USER/HDAS_DB_PASS.
REM Example (one-time): set IMPORT_SCHEMA=1 && set DB_USER=root && set DB_PASS=yourpass && start-dev.bat
set "IMPORT_SCHEMA=%IMPORT_SCHEMA%"
if not defined IMPORT_SCHEMA set IMPORT_SCHEMA=0

REM Prepare credentials: prefer env vars if DB_USER/DB_PASS not defined
if not defined DB_USER (
  if defined HDAS_DB_USER (
    set "DB_USER=%HDAS_DB_USER%"
  ) else (
    set "DB_USER=root"
  )
)
if not defined DB_PASS (
  if defined HDAS_DB_PASS (
    set "DB_PASS=%HDAS_DB_PASS%"
  ) else (
    set "DB_PASS="
  )
)

if "%IMPORT_SCHEMA%"=="1" goto DO_IMPORT
echo [Schema] Import disabled (IMPORT_SCHEMA=0). Skipping.
goto START_SERVICES

:DO_IMPORT
if not exist SCHEMA_CONSOLIDATED.sql (
  echo [Schema] SCHEMA_CONSOLIDATED.sql not found at repo root. Skipping import.
  goto START_SERVICES
)
where mysql >nul 2>&1
if errorlevel 1 (
  echo [Schema] mysql client not found in PATH. Skipping import.
  goto START_SERVICES
)
if not defined DB_USER (
  echo [Schema] DB_USER not set. Set DB_USER/DB_PASS or HDAS_DB_USER/HDAS_DB_PASS.
  goto START_SERVICES
)
if not defined DB_PASS (
  echo [Schema] Warning: DB_PASS not set; mysql may prompt if password is required.
  mysql -u %DB_USER% -p < SCHEMA_CONSOLIDATED.sql
) else (
  echo [Schema] Importing SCHEMA_CONSOLIDATED.sql...
  mysql -u %DB_USER% --password=%DB_PASS% < SCHEMA_CONSOLIDATED.sql
)

:START_SERVICES

REM ---- Backend (Spring Boot dev) ----
echo [Backend] Starting Spring Boot (dev profile) in a new window...
start "HDAS Backend" cmd /c mvn -f backend\pom.xml spring-boot:run -Dspring-boot.run.profiles=dev

REM ---- Frontend (Next.js dev) ----
echo [Frontend] Installing deps (if needed) and starting Next.js dev server in a new window...
start "HDAS Frontend" cmd /c "cd frontend && npm install && npm run dev"

REM ---- Info ----
echo.
echo [Info] Backend: http://localhost:8080 (health: /actuator/health)
echo [Info] Frontend: http://localhost:3001

echo [Done] Dev environment launching. Windows may prompt for new terminal windows.
popd >nul
endlocal
