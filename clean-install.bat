@echo off
REM ========================================
REM JJ Swim Lab - Clean Install Script
REM ========================================
REM Remove all node_modules and reinstall
REM Use when: package manager conflicts, version issues
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - Clean Install
color 0E

echo ========================================
echo   JJ Swim Lab - Clean Install
echo ========================================
echo.
echo This will:
echo   1. Remove all node_modules
echo   2. Remove package-lock.json (npm)
echo   3. Keep pnpm-lock.yaml (pnpm)
echo   4. Reinstall all dependencies
echo.
echo Press Ctrl+C to cancel, or
pause

cd /d "%~dp0"

REM ========================================
REM Step 1: Clean Server
REM ========================================
echo.
echo [1/4] Cleaning server...

if exist "server\node_modules" (
    echo [INFO] Removing server\node_modules...
    rd /s /q "server\node_modules" 2>nul
    echo [OK] Removed
) else (
    echo [OK] Already clean
)

if exist "server\package-lock.json" (
    echo [INFO] Removing server\package-lock.json (npm)...
    del /f /q "server\package-lock.json" 2>nul
    echo [OK] Removed npm lock file
)

echo.

REM ========================================
REM Step 2: Clean Client
REM ========================================
echo [2/4] Cleaning client...

if exist "client\node_modules" (
    echo [INFO] Removing client\node_modules...
    rd /s /q "client\node_modules" 2>nul
    echo [OK] Removed
) else (
    echo [OK] Already clean
)

if exist "client\package-lock.json" (
    echo [INFO] Removing client\package-lock.json (npm)...
    del /f /q "client\package-lock.json" 2>nul
    echo [OK] Removed npm lock file
)

REM Clean Next.js cache
if exist "client\.next" (
    echo [INFO] Removing client\.next cache...
    rd /s /q "client\.next" 2>nul
    echo [OK] Cache removed
)

echo.

REM ========================================
REM Step 3: Clean Root
REM ========================================
echo [3/4] Cleaning root...

if exist "node_modules" (
    echo [INFO] Removing root\node_modules...
    rd /s /q "node_modules" 2>nul
    echo [OK] Removed
) else (
    echo [OK] Already clean
)

if exist "package-lock.json" (
    echo [INFO] Removing package-lock.json (npm)...
    del /f /q "package-lock.json" 2>nul
    echo [OK] Removed npm lock file
)

echo.

REM ========================================
REM Step 4: Fresh Install with pnpm
REM ========================================
echo [4/4] Fresh install with pnpm...
echo.

echo [INFO] Installing server dependencies...
cd server
call pnpm install
cd ..
echo [OK] Server done
echo.

echo [INFO] Installing client dependencies...
cd client
call pnpm install
cd ..
echo [OK] Client done
echo.

echo [INFO] Installing root dependencies (if any)...
if exist "package.json" (
    call pnpm install
    echo [OK] Root done
)

echo.
echo ========================================
echo   Clean Install Complete!
echo ========================================
echo.
echo All dependencies reinstalled with pnpm
echo.
echo Next steps:
echo   1. start-server.bat - Start servers
echo   2. check-server-health.bat - Check status
echo.
echo ========================================
pause

