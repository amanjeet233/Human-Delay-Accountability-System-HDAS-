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

REM ---- Check for running processes ----
echo [Check] Checking for existing services...

REM Check if backend is already running
netstat -an | findstr ":%BACKEND_PORT%" >nul
if not errorlevel 1 (
    echo [Warning] Backend already running on port %BACKEND_PORT%
    set "SKIP_BACKEND=1"
) else (
    set "SKIP_BACKEND=0"
)

REM Check if frontend is already running
netstat -an | findstr ":%FRONTEND_PORT%" >nul
if not errorlevel 1 (
    echo [Warning] Frontend already running on port %FRONTEND_PORT%
    set "SKIP_FRONTEND=1"
) else (
    set "SKIP_FRONTEND=0"
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
    echo [Backend] Starting Spring Boot application...
    start "HDAS Backend - Port %BACKEND_PORT%" cmd /k "cd /d \"%~dp0backend\" && echo Starting backend... && mvn spring-boot:run -Dspring-boot.run.profiles=dev"
    
    echo [Backend] Waiting %START_DELAY% seconds for backend to initialize...
    timeout /t %START_DELAY% /nobreak >nul
    
    REM Check if backend started successfully
    netstat -an | findstr ":%BACKEND_PORT%" >nul
    if not errorlevel 1 (
        echo [Backend] Backend started successfully on port %BACKEND_PORT%.
    ) else (
        echo [Warning] Backend may not have started properly. Check the backend window.
    )
) else (
    echo [Backend] Skipping backend startup (already running).
)

REM Start Frontend
if "%SKIP_FRONTEND%"=="0" (
    echo [Frontend] Starting Next.js development server...
    start "HDAS Frontend - Port %FRONTEND_PORT%" cmd /k "cd /d \"%~dp0frontend\" && echo Starting frontend... && npm run dev"
    
    REM Wait a bit for frontend to start
    timeout /t 5 /nobreak >nul
    
    REM Check if frontend started successfully
    netstat -an | findstr ":%FRONTEND_PORT%" >nul
    if not errorlevel 1 (
        echo [Frontend] Frontend started successfully on port %FRONTEND_PORT%.
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
    echo Backend:  http://localhost:%BACKEND_PORT% ^(Starting^)
) else (
    echo Backend:  http://localhost:%BACKEND_PORT% ^(Already Running^)
)
if "%SKIP_FRONTEND%"=="0" (
    echo Frontend: http://localhost:%FRONTEND_PORT% ^(Starting^)
) else (
    echo Frontend: http://localhost:%FRONTEND_PORT% ^(Already Running^)
)
echo MySQL:    Service %MYSQL_SERVICE%
echo.
echo Application URLs:
echo - Backend API:     http://localhost:%BACKEND_PORT%
echo - Frontend App:    http://localhost:%FRONTEND_PORT%
echo - Health Check:    http://localhost:%BACKEND_PORT%/actuator/health
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
