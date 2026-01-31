d:\CU\SEM 6\pr 2.0\HUMAN DELAY ACCOUNTABILITY SYSTEM2\start-all.batd:\CU\SEM 6\pr 2.0\HUMAN DELAY ACCOUNTABILITY SYSTEM2\start-all.batd:\CU\SEM 6\pr 2.0\HUMAN DELAY ACCOUNTABILITY SYSTEM2\start-all.bat@echo off
setlocal

REM Reset HDAS admin password to 'admin123' by updating bcrypt hash in MySQL.
REM Uses env HDAS_DB_USER/HDAS_DB_PASS if set, otherwise defaults to root/Amanjeet@4321.

set "DB_USER=%HDAS_DB_USER%"
if not defined DB_USER set "DB_USER=root"
set "DB_PASS=%HDAS_DB_PASS%"
if not defined DB_PASS set "DB_PASS=Amanjeet@4321."

set "HASH=$2b$10$PH1Ad4nHBRcrqWPJ18wd.Oqu8RzowMnwOEAw86IG/JBuI2eatKbEu"

echo Resetting admin password in database 'hdas'...
mysql -u %DB_USER% --password=%DB_PASS% -e "UPDATE hdas.users SET password_hash='%HASH%' WHERE username='admin';"
if errorlevel 1 (
  echo [ERROR] Failed to reset admin password. Verify MySQL is running and credentials are correct.
  exit /b 1
) else (
  echo [OK] Admin password reset to 'admin123'.
)

endlocal
