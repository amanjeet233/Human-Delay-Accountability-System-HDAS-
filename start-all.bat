@echo off
echo Killing processes on ports 8081 and 3001...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8081" ^| find "LISTENING"') do (
    echo Killing PID %%a on port 8081
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Killing PID %%a on port 3001
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Starting HDAS Backend...
cd /d "%~dp0backend"
start "HDAS Backend" cmd /k "mvn package -DskipTests && java -jar target\human-delay-accountability-system-1.0.0.jar --spring.profiles.active=dev --server.port=8081"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting HDAS Frontend...
cd /d "%~dp0frontend"
start "HDAS Frontend" cmd /k "npm run dev -- --port 3001"

echo.
echo Both services should be starting in new windows.
echo Backend: http://localhost:8081
echo Frontend: http://localhost:3001
pause
