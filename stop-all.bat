@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Stop All Services Script
REM - Stops backend and frontend processes
REM - Optionally stops MySQL service
REM =============================================================

title HDAS Stop Services

echo =============================================================
echo HDAS Stop All Services Script
echo =============================================================
echo.

set "BACKEND_PORT=8080"
set "FRONTEND_PORT=3001"
set "MYSQL_SERVICE=MySQL80"

REM ---- Check what's running ----
echo [Check] Checking for running services...

set "BACKEND_RUNNING=0"
set "FRONTEND_RUNNING=0"

netstat -an | findstr ":%BACKEND_PORT%" >nul
if not errorlevel 1 (
    set "BACKEND_RUNNING=1"
    echo [Found] Backend running on port %BACKEND_PORT%
)

netstat -an | findstr ":%FRONTEND_PORT%" >nul
if not errorlevel 1 (
    set "FRONTEND_RUNNING=1"
    echo [Found] Frontend running on port %FRONTEND_PORT%
)

if "%BACKEND_RUNNING%"=="0" if "%FRONTEND_RUNNING%"=="0" (
    echo [Info] No HDAS services found running.
    goto :mysql_prompt
)

echo.

REM ---- Stop Backend ----
if "%BACKEND_RUNNING%"=="1" (
    echo [Backend] Stopping backend processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%BACKEND_PORT%"') do (
        echo [Backend] Terminating process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    
    REM Verify stopped
    netstat -an | findstr ":%BACKEND_PORT%" >nul
    if errorlevel 1 (
        echo [Backend] Backend stopped successfully.
    ) else (
        echo [Warning] Backend may still be running.
    )
)

REM ---- Stop Frontend ----
if "%FRONTEND_RUNNING%"=="1" (
    echo [Frontend] Stopping frontend processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONTEND_PORT%"') do (
        echo [Frontend] Terminating process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    
    REM Verify stopped
    netstat -an | findstr ":%FRONTEND_PORT%" >nul
    if errorlevel 1 (
        echo [Frontend] Frontend stopped successfully.
    ) else (
        echo [Warning] Frontend may still be running.
    )
)

:mysql_prompt
echo.
set /p "STOP_MYSQL=Stop MySQL service %MYSQL_SERVICE%? (y/N): "
if /i "%STOP_MYSQL%"=="y" (
    echo [MySQL] Stopping MySQL service...
    net stop "%MYSQL_SERVICE%" >nul 2>&1
    if not errorlevel 1 (
        echo [MySQL] MySQL service stopped.
    ) else (
        echo [Warning] Failed to stop MySQL service or service not running.
    )
)

echo.
echo =============================================================
echo Stop Complete
echo =============================================================
echo.
echo All requested services have been stopped.
echo.
pause
