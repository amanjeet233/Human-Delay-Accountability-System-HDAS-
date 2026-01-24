@echo off
REM =====================================================
REM HDAS Backend - Compile and Run Script
REM Fixed for Java 21
REM =====================================================

echo.
echo ========================================
echo HDAS Backend - Build and Run
echo ========================================
echo.

REM Navigate to backend directory
cd /d D:\CU\SEM 6\pr 2.0\HUMAN DELAY ACCOUNTABILITY SYSTEM2\backend

echo [1/4] Checking Java version...
java -version
echo.

echo [2/4] Cleaning previous build...
call mvn clean
if %errorlevel% neq 0 goto :error

echo.
echo [3/4] Compiling with Java 21...
call mvn compile -DskipTests
if %errorlevel% neq 0 goto :error

echo.
echo [4/4] Starting Spring Boot application...
echo.
echo ========================================
echo Application will start on:
echo http://localhost:8080
echo.
echo Login credentials:
echo Username: admin
echo Password: admin123
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

call mvn spring-boot:run
goto :end

:error
echo.
echo ========================================
echo ERROR during build process!
echo ========================================
echo.
echo Troubleshooting:
echo 1. Make sure Java 21 is installed
echo 2. Try: mvn clean install -DskipTests
echo 3. Check pom.xml has java.version=21
echo.
pause
goto :end

:end
echo.
echo Finished.
pause
