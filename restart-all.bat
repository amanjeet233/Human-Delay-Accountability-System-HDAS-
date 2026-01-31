@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Restart Script
REM - Stops frontend (ports 3000-3010)
REM - Stops backend (ports 8080-8090)
REM - Restarts via start-all.bat
REM =============================================================

title HDAS Restart

echo =============================================================
echo HDAS Restart Script
echo =============================================================
echo.

REM Change to project root
cd /d "%~dp0"

set "FRONT_START=3000"
set "FRONT_END=3010"
set "BACK_START=8080"
set "BACK_END=8090"

echo [Stop] Checking and stopping frontend ports %FRONT_START%-%FRONT_END%...
for /l %%P in (%FRONT_START%,1,%FRONT_END%) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P"') do (
    echo [Frontend] Terminating PID %%a on port %%P
    taskkill /F /PID %%a >nul 2>&1
  )
)

echo [Stop] Checking and stopping backend ports %BACK_START%-%BACK_END%...
for /l %%P in (%BACK_START%,1,%BACK_END%) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P"') do (
    echo [Backend] Terminating PID %%a on port %%P
    taskkill /F /PID %%a >nul 2>&1
  )
)

echo [Verify] Waiting for processes to terminate...
timeout /t 2 /nobreak >nul

REM Optional: display remaining listeners in ranges
echo [Verify] Remaining listeners (if any):
netstat -ano | findstr ":%FRONT_START%" >nul 2>&1
netstat -ano | findstr ":%BACK_START%" >nul 2>&1

echo.
echo [Start] Relaunching services via start-all.bat...
call start-all.bat

echo.
echo =============================================================
echo Restart sequence initiated. Check the opened windows.
echo =============================================================
echo.
pause

endlocal
exit /b 0
