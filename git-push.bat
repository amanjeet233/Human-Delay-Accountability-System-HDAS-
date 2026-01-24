@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================================
REM HDAS Git Push Helper (Fixed Version)
REM - Adds all changes, commits with a message, and pushes to origin
REM - Uses current branch by default
REM - Better error handling and status checking
REM =============================================================

title HDAS Git Push

echo =============================================================
echo HDAS Git Push Helper
echo =============================================================
echo.

REM Change to repo root
cd /d "%~dp0"

REM Check if we're in a git repository
if not exist ".git" (
    echo [Error] Not in a Git repository. .git folder not found.
    goto :error_exit
)

REM Determine current branch
for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set BRANCH=%%b
if not defined BRANCH (
    echo [Error] Could not determine current branch.
    echo [Info] Make sure you're on a valid branch.
    goto :error_exit
)

echo [Git] Current branch: %BRANCH%

REM Collect commit message from args or prompt
set "COMMIT=%*"
if "%COMMIT%"=="" (
    set /p COMMIT="Enter commit message: "
)
if "%COMMIT%"=="" (
    echo [Error] Empty commit message. Aborting.
    goto :error_exit
)

echo [Git] Commit message: "%COMMIT%"
echo.

REM Check git status first
echo [Git] Checking repository status...
git status --short

echo.
REM Stage changes
echo [Git] Staging all changes...
git add -A
if errorlevel 1 (
    echo [Error] Failed to stage changes.
    goto :error_exit
)

REM Check if there are staged changes
git diff --cached --quiet >nul 2>nul
if not errorlevel 1 (
    echo [Git] No changes to commit (working tree clean).
    goto :skip_commit
)

REM Commit changes
echo [Git] Committing changes...
git commit -m "%COMMIT%"
if errorlevel 1 (
    echo [Error] Failed to commit changes.
    goto :error_exit
)
echo [Git] Changes committed successfully.

:skip_commit

REM Check if remote exists
echo [Git] Checking remote repository...
git remote get-url origin >nul 2>nul
if errorlevel 1 (
    echo [Warning] No remote 'origin' found. Skipping push.
    echo [Info] To add a remote, use: git remote add origin ^<repository-url^>
    goto :success_exit
)

REM Get remote URL for display
for /f "delims=" %%u in ('git remote get-url origin') do set REMOTE_URL=%%u
echo [Git] Remote origin: %REMOTE_URL%

REM Check if branch has upstream tracking
git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>nul
if errorlevel 1 (
    echo [Git] Branch %BRANCH% has no upstream tracking. Setting up...
    git push --set-upstream origin %BRANCH%
    if not errorlevel 1 (
        echo [Git] Upstream tracking set and pushed successfully.
    ) else (
        echo [Error] Failed to set upstream and push.
        goto :error_exit
    )
) else (
    REM Push to origin
    echo [Git] Pushing to origin/%BRANCH%...
    git push origin %BRANCH%
    if errorlevel 1 (
        echo [Error] Failed to push to remote.
        echo [Info] You may need to pull changes first: git pull
        goto :error_exit
    )
    echo [Git] Pushed successfully.
)

goto :success_exit

:error_exit
echo.
echo =============================================================
echo Git Operation Failed
echo =============================================================
echo Please check the error messages above and try again.
echo.
pause
exit /b 1

:success_exit
echo.
echo =============================================================
echo Git Operation Complete
echo =============================================================
echo.
echo Repository: %BRANCH%
echo Remote: origin
echo Status: Success
echo.
pause
exit /b 0
