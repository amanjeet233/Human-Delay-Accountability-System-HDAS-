@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Frontend Startup Script
REM - Starts Next.js development server
REM - Installs dependencies if needed
REM - Uses port 3001
REM =============================================================

title HDAS Frontend

echo =============================================================
echo HDAS Frontend Startup Script
echo =============================================================
echo.

REM Change to project root
cd /d "%~dp0"

REM ---- Check Prerequisites ----
echo [Check] Verifying prerequisites...

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js.
    pause
    exit /b 1
)

REM Check npm
npm -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found. Please install npm.
    pause
    exit /b 1
)

echo [Check] Prerequisites verified.
echo.

REM ---- Check if frontend is already running ----
set "FRONTEND_PORT=3001"
netstat -an | findstr ":%FRONTEND_PORT%" >nul
if not errorlevel 1 (
    echo [Warning] Frontend already running on port %FRONTEND_PORT%
    echo [Info] Close the existing frontend process first.
    pause
    exit /b 1
)

REM ---- Frontend Dependencies ----
echo [Frontend] Checking dependencies...
cd frontend

if not exist "node_modules" (
    echo [Frontend] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Dependency installation failed.
        cd ..
        pause
        exit /b 1
    )
    echo [Frontend] Dependencies installed successfully.
) else (
    echo [Frontend] Dependencies already installed.
)

cd ..
echo.

REM ---- Start Frontend ----
echo [Frontend] Starting Next.js development server...
echo [Frontend] URL: http://localhost:%FRONTEND_PORT%
echo.
echo [Info] The frontend will start in a new window.
echo [Info] Press Ctrl+C in that window to stop the server.
echo.

start "HDAS Frontend - Port %FRONTEND_PORT%" cmd /k "cd /d \"%~dp0frontend\" && echo Starting HDAS Frontend... && npm run dev"

echo.
echo =============================================================
echo Frontend Starting...
echo =============================================================
echo.
echo Access your application at: http://localhost:%FRONTEND_PORT%
echo.
echo Press any key to exit this launcher (frontend will continue running)...
pause >nul

echo.
echo Launcher closed. Frontend continues running in the separate window.
echo To stop the frontend, close its window or press Ctrl+C in it.
echo.
timeout /t 3 /nobreak >nul
exit /b 0
