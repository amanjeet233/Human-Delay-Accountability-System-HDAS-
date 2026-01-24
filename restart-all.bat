@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Restart All Services Script
REM - Stops all services
REM - Starts all services again
REM =============================================================

title HDAS Restart Services

echo =============================================================
echo HDAS Restart All Services Script
echo =============================================================
echo.

echo [Step 1] Stopping all services...
call "%~dp0stop-all.bat"

echo.
echo [Step 2] Waiting 5 seconds before restart...
timeout /t 5 /nobreak >nul

echo.
echo [Step 3] Starting all services...
call "%~dp0start-all.bat"

echo.
echo =============================================================
echo Restart Complete
echo =============================================================
pause
