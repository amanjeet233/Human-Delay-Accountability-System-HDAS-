@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Complete Startup Script
REM - Starts MySQL service
REM - Starts Spring Boot backend
REM - Starts Next.js frontend
REM - Includes comprehensive error handling
REM =============================================================

title HDAS Startup Launcher

echo =============================================================
echo HDAS Complete Startup Script
echo =============================================================
echo.

REM Change to project root
cd /d "%~dp0"

REM ---- Configuration ----
set "MYSQL_SERVICE=MySQL80"
set "BACKEND_PORT=8080"
set "FRONTEND_PORT=3001"
set "START_DELAY=15"
REM Force opening new windows regardless of existing processes (set ALWAYS_NEW_WINDOWS=1)
set "ALWAYS_NEW_WINDOWS=%ALWAYS_NEW_WINDOWS%"

REM ---- Check for running processes ----
echo [Check] Checking for existing services...

REM Detect existing backend on 8080-8090 via /actuator/health
set "BACK_PORT=%BACKEND_PORT%"
set "SKIP_BACKEND=0"
for /l %%P in (8080,1,8090) do (
    powershell -NoProfile -Command "try { iwr http://localhost:%%P/actuator/health -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
    if not errorlevel 1 (
        set "BACK_PORT=%%P"
        set "SKIP_BACKEND=1"
        goto BACKEND_DETECTED
    )
)
:BACKEND_DETECTED

REM If backend not running, find a free port starting from BACKEND_PORT
if "%SKIP_BACKEND%"=="0" (
    :CHECK_BACKEND_PORT
    netstat -an | findstr ":%BACK_PORT%" >nul
    if not errorlevel 1 (
        echo [Info] Port %BACK_PORT% is busy, trying next...
        set /a BACK_PORT+=1
        goto CHECK_BACKEND_PORT
    )
)

REM Check if frontend is already running
netstat -an | findstr ":%FRONTEND_PORT%" >nul
if not errorlevel 1 (
    echo [Warning] Frontend already running on port %FRONTEND_PORT%
    set "SKIP_FRONTEND=1"
) else (
    set "SKIP_FRONTEND=0"
)

REM Override: always open new windows even if ports are busy
if defined ALWAYS_NEW_WINDOWS (
    if "%ALWAYS_NEW_WINDOWS%"=="1" (
        echo [Override] ALWAYS_NEW_WINDOWS=1 → forcing new windows for backend and frontend.
        set "SKIP_BACKEND=0"
        set "SKIP_FRONTEND=0"
    )
)

REM ---- MySQL Service ----
echo [MySQL] Checking MySQL service "%MYSQL_SERVICE%"...
sc query "%MYSQL_SERVICE%" 2>nul | findstr "RUNNING" >nul
if not errorlevel 1 (
    echo [MySQL] Service %MYSQL_SERVICE% is already running.
) else (
    echo [MySQL] Starting MySQL service...
    net start "%MYSQL_SERVICE%" >nul 2>&1
    if not errorlevel 1 (
        echo [MySQL] Service started successfully.
    ) else (
        echo [MySQL] Failed to start service %MYSQL_SERVICE%.
        echo [MySQL] Please check MySQL installation or start it manually.
        echo [MySQL] Continuing with application startup...
    )
)

REM ---- Prerequisites Check ----
echo [Check] Verifying prerequisites...

REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java not found. Please install Java 21.
    goto :error_exit
)

REM Check Maven
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Maven not found. Please install Maven.
    goto :error_exit
)

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js.
    goto :error_exit
)

REM Check npm
npm -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found. Please install npm.
    goto :error_exit
)

echo [Check] All prerequisites verified.
echo.

REM ---- Frontend Dependencies ----
if "%SKIP_FRONTEND%"=="0" (
    echo [Frontend] Installing dependencies...
    cd frontend
    call npm install --silent
    if errorlevel 1 (
        echo [ERROR] Frontend dependency installation failed.
        cd ..
        goto :error_exit
    )
    cd ..
    echo [Frontend] Dependencies installed successfully.
)

REM ---- Start Services ----
echo.
echo =============================================================
echo Starting Services...
echo =============================================================

REM Start Backend
if "%SKIP_BACKEND%"=="0" (
    echo [Backend] Starting Spring Boot application in a new system window...
    start "HDAS Backend - Port %BACK_PORT%" "%ComSpec%" /k "cd /d \"%~dp0backend\" && echo Starting backend... && mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments=--server.port=%BACK_PORT%"
    
    echo [Backend] Waiting %START_DELAY% seconds for backend to initialize...
    timeout /t %START_DELAY% /nobreak >nul
    
    REM Check if backend started successfully
    netstat -an | findstr ":%BACK_PORT%" >nul
    if not errorlevel 1 (
        echo [Backend] Backend started successfully on port %BACK_PORT%.
    ) else (
        echo [Warning] Backend may not have started properly. Check the backend window.
    )
) else (
    echo [Backend] Skipping backend startup (already running).
)

REM Start Frontend
if "%SKIP_FRONTEND%"=="0" (
    REM Determine available port, starting from FRONTEND_PORT
    set "FRONT_PORT=%FRONTEND_PORT%"
    :CHECK_FRONT_PORT
    netstat -an | findstr ":%FRONT_PORT%" >nul
    if not errorlevel 1 (
        set /a FRONT_PORT+=1
        goto CHECK_FRONT_PORT
    )
    echo [Frontend] Starting Next.js development server on port %FRONT_PORT%...
    echo NEXT_PUBLIC_API_URL=http://localhost:%BACK_PORT%> "%~dp0frontend\.env.local"
    start "HDAS Frontend - Port %FRONT_PORT%" "%ComSpec%" /k "cd /d \"%~dp0frontend\" && echo Starting frontend... && set NEXT_PUBLIC_API_URL=http://localhost:%BACK_PORT% && npm run dev -- -p %FRONT_PORT%"
    
    REM Wait a bit for frontend to start
    timeout /t 5 /nobreak >nul
    
    REM Check if frontend started successfully
    netstat -an | findstr ":%FRONT_PORT%" >nul
    if not errorlevel 1 (
        echo [Frontend] Frontend started successfully on port %FRONT_PORT%.
    ) else (
        echo [Warning] Frontend may not have started properly. Check the frontend window.
    )
) else (
    echo [Frontend] Skipping frontend startup (already running).
)

REM ---- Display Status ----
echo.
echo =============================================================
echo HDAS Startup Complete
echo =============================================================
echo.
echo Service Status:
echo ----------------
if "%SKIP_BACKEND%"=="0" (
    echo Backend:  http://localhost:%BACK_PORT% ^(Starting^)
) else (
    echo Backend:  http://localhost:%BACK_PORT% ^(Already Running^)
)
if "%SKIP_FRONTEND%"=="0" (
    echo Frontend: http://localhost:%FRONT_PORT% ^(Starting^)
) else (
    echo Frontend: http://localhost:%FRONTEND_PORT% ^(Already Running^)
)
echo MySQL:    Service %MYSQL_SERVICE%
echo.
echo Application URLs:
echo - Backend API:     http://localhost:%BACKEND_PORT%
echo - Frontend App:    http://localhost:%FRONT_PORT%
echo - Health Check:    http://localhost:%BACK_PORT%/actuator/health
echo.
echo Windows opened for each service. Check them for detailed logs.
echo.
echo Press any key to exit this launcher (services will continue running)...
pause >nul
goto :end

:error_exit
echo.
echo =============================================================
echo Startup Failed
echo =============================================================
echo Please fix the errors above and try again.
echo.
pause
exit /b 1

:end
echo.
echo Launcher closed. Services continue running in background.
echo To stop services, close their respective windows or use Ctrl+C in each window.
echo.
timeout /t 3 /nobreak >nul
exit /b 0
