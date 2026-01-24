@echo off
setlocal

echo HDAS Git Push Helper
echo ====================

cd /d "%~dp0"

if "%1"=="" (
    set /p msg="Enter commit message: "
) else (
    set "msg=%1"
)

echo Staging changes...
git add -A

echo Committing with message: "%msg%"
git commit -m "%msg%"

echo Pushing to GitHub...
git push origin main

echo Done!
pause
