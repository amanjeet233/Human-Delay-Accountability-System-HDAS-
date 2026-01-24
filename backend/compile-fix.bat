@echo off
REM Fix compilation with Java 21

echo Cleaning previous build...
call mvn clean

echo.
echo Compiling with Java 21...
call mvn compile -DskipTests

echo.
echo Compilation complete!
echo.
echo To run the application, execute:
echo mvn spring-boot:run
echo.
pause
