@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Frontend Stop Script
REM - Stops Next.js development server
REM =============================================================

title HDAS Stop Frontend

echo =============================================================
echo HDAS Frontend Stop Script
echo =============================================================
echo.

set "FRONTEND_PORT=3001"

REM ---- Check if frontend is running ----
echo [Check] Checking for frontend on port %FRONTEND_PORT%...

netstat -an | findstr ":%FRONTEND_PORT%" >nul
if errorlevel 1 (
    echo [Info] No frontend process found on port %FRONTEND_PORT%.
    goto :end
)

echo [Found] Frontend running on port %FRONTEND_PORT%

REM ---- Stop frontend processes ----
echo [Frontend] Stopping frontend processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONTEND_PORT%"') do (
    echo [Frontend] Terminating process %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Wait a moment for processes to stop
timeout /t 2 /nobreak >nul

REM ---- Verify stopped ----
netstat -an | findstr ":%FRONTEND_PORT%" >nul
if errorlevel 1 (
    echo [Success] Frontend stopped successfully.
) else (
    echo [Warning] Frontend may still be running.
)

:end
echo.
echo =============================================================
echo Stop Complete
echo =============================================================
echo.
pause
