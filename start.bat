@echo off
title HDAS Launcher
echo Starting HDAS Applications...
cd /d "%~dp0"

REM Load backend environment variables (DB credentials)
if exist "%~dp0backend\application.env" (
	for /f "usebackq tokens=1* delims==" %%A in ("%~dp0backend\application.env") do (
		set "%%A=%%B"
	)
)

REM Detect existing backend on 8080-8090 via /actuator/health
set "BACK_PORT=8080"
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

REM If backend not running, pick a free port
if "%SKIP_BACKEND%"=="0" (
	:CHECK_BACK_PORT
	netstat -an | findstr ":%BACK_PORT%" >nul
	if not errorlevel 1 (
		set /a BACK_PORT+=1
		goto CHECK_BACK_PORT
	)
)

REM Start Backend with dev profile in a new window on chosen port
if "%SKIP_BACKEND%"=="0" (
	start "HDAS Backend (dev) - Port %BACK_PORT%" cmd /k "cd /d backend && set SPRING_PROFILES_ACTIVE=dev && set SERVER_PORT=%BACK_PORT% && mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments=--server.port=%BACK_PORT%"
) else (
	echo [INFO] Backend already running on port %BACK_PORT%.
)

REM Small delay before starting frontend
timeout /t 2 >nul

REM Start Frontend in a new window
REM Lock to single port 3001; error if occupied
set "FRONT_PORT=3001"
netstat -an | findstr ":%FRONT_PORT%" >nul
if not errorlevel 1 (
	echo [ERROR] Frontend port %FRONT_PORT% is already in use. Please stop other Next.js instances.
	echo Tip: run scripts\kill-port.bat common or scripts\kill-port.bat %FRONT_PORT%
	pause
	goto DONE
)

REM Persist backend URL for Next.js env loading
echo NEXT_PUBLIC_API_URL=http://localhost:%BACK_PORT%> "%~dp0frontend\.env.local"

REM Clean previous Next.js build cache
if exist "%~dp0frontend\.next" (
	rmdir /s /q "%~dp0frontend\.next"
)

start "HDAS Frontend" "%ComSpec%" /k "cd /d frontend && set NEXT_PUBLIC_API_URL=http://localhost:%BACK_PORT% && npm run dev -- -p %FRONT_PORT%"

echo Backend: http://localhost:%BACK_PORT% (profile: dev)
echo Frontend: http://localhost:%FRONT_PORT%
echo Login: admin/admin123 (dev)
pause

:DONE
