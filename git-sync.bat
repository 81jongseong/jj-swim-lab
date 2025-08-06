@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cd /d %~dp0

echo ==============================
echo      GIT SYNC START
echo ==============================

:: Git repository check
git rev-parse --git-dir >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Not a Git repository.
    pause
    exit /b 1
)

:: Current branch check
FOR /F "delims=" %%b IN ('git rev-parse --abbrev-ref HEAD 2^>nul') DO (
    set BRANCH=%%b
)
if not defined BRANCH (
    echo [ERROR] Cannot get current branch.
    pause
    exit /b 1
)
echo [INFO] Current branch: %BRANCH%

:: Remote repository check
git remote get-url origin >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Remote repository not configured.
    pause
    exit /b 1
)

:: Check for changes
git diff --quiet HEAD
IF ERRORLEVEL 1 (
    echo [INFO] Changes detected - preparing auto commit

    git add .

    set /p COMMIT_MSG=[INPUT] Enter commit message: 
    REM Remove spaces and check if string exists
    set "COMMIT_MSG_CLEAN=!COMMIT_MSG: =!"

    if "!COMMIT_MSG_CLEAN!"=="" (
        set COMMIT_MSG=Auto commit
        echo [INFO] No commit message - using default: !COMMIT_MSG!
    ) else (
        echo [INFO] Entered message: !COMMIT_MSG!
    )

    echo [STEP] git commit...
    git commit -m "!COMMIT_MSG!"
    IF ERRORLEVEL 1 (
        echo [ERROR] Commit failed. Sync stopped.
        pause
        exit /b 1
    )
    echo [INFO] Commit completed
) ELSE (
    echo [INFO] No changes detected
)

:: Fetch from remote
echo [STEP] git fetch...
git fetch origin
IF ERRORLEVEL 1 (
    echo [ERROR] git fetch failed
    pause
    exit /b 1
)

:: Compare local and remote
git rev-list --count HEAD..origin/%BRANCH% >nul 2>&1
IF NOT ERRORLEVEL 1 (
    echo [INFO] New commits on remote detected.
    echo [STEP] git pull --rebase...
    git pull --rebase origin %BRANCH%
    IF ERRORLEVEL 1 (
        echo [ERROR] git pull --rebase failed or conflict
        echo [INFO] Please resolve conflicts and run again.
        pause
        exit /b 1
    )
    echo [INFO] Pull completed
) ELSE (
    echo [INFO] No new commits on remote
)

:: Push (only if there are changes to push)
git rev-list --count origin/%BRANCH%..HEAD >nul 2>&1
IF NOT ERRORLEVEL 1 (
    echo [STEP] git push...
    git push origin %BRANCH%
    IF ERRORLEVEL 1 (
        echo [ERROR] git push failed
        pause
        exit /b 1
    )
    echo [INFO] Push completed
) ELSE (
    echo [INFO] No changes to push
)

echo ==============================
echo [DONE] Git sync completed
echo ==============================
pause
exit /b 0
