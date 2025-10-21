@echo off
REM ========================================
REM JJ Swim Lab - Server Start Script
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - Server Start
color 0A

echo ========================================
echo   JJ Swim Lab - Development Server
echo ========================================
echo.

REM Set to script directory
cd /d "%~dp0"

REM ========================================
REM Step 1: Environment Check
REM ========================================
echo [1/6] Checking environment...

REM Check pnpm
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pnpm not installed
    echo.
    echo Install: npm install -g pnpm
    echo.
    pause
    exit /b 1
)
echo [OK] pnpm installed

REM Check server .env - ONLY check if exists, don't require env.example
if exist "server\.env" (
    echo [OK] server\.env exists
) else (
    echo [ERROR] server\.env not found
    echo.
    echo Please create server\.env file with:
    echo   MONGODB_URI=your_mongodb_atlas_uri
    echo   JWT_SECRET=your_secret_key
    echo   PORT=5000
    echo.
    pause
    exit /b 1
)

echo.

REM ========================================
REM Step 2: Port Conflict Check
REM ========================================
echo [2/6] Checking port conflicts...

REM Kill port 5000 if in use
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Port 5000 in use - killing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
)
echo [OK] Port 5000 available

REM Kill port 3000 if in use
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Port 3000 in use - killing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
)
echo [OK] Port 3000 available

echo.

REM ========================================
REM Step 3: Clean Existing Processes
REM ========================================
echo [3/6] Cleaning processes...

tasklist | findstr /i "node.exe" >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Stopping Node.js...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo [OK] Cleaned
) else (
    echo [OK] No processes
)

echo.

REM ========================================
REM Step 4: Dependency Check
REM ========================================
echo [4/6] Checking dependencies...

if not exist "server\node_modules" (
    echo [WARN] server\node_modules not found
    echo [INFO] Installing... (1-2 min)
    cd server
    call pnpm install
    cd ..
    echo [OK] Server deps installed
) else (
    echo [OK] server\node_modules OK
)

if not exist "client\node_modules" (
    echo [WARN] client\node_modules not found
    echo [INFO] Installing... (1-2 min)
    cd client
    call pnpm install
    cd ..
    echo [OK] Client deps installed
) else (
    echo [OK] client\node_modules OK
)

echo.

REM ========================================
REM Step 5: Start Backend Server
REM ========================================
echo [5/6] Starting backend...
echo [INFO] MongoDB Atlas connection

start "JJ Swim Lab - Backend :5000" cmd /k "cd /d "%~dp0server" && pnpm run dev"

echo [OK] Backend started
echo       http://localhost:5000
echo.
timeout /t 5 /nobreak >nul

echo.

REM ========================================
REM Step 6: Start Frontend Client
REM ========================================
echo [6/6] Starting frontend...

start "JJ Swim Lab - Frontend :3000" cmd /k "cd /d "%~dp0client" && pnpm run dev"

echo [OK] Frontend started
echo       http://localhost:3000
echo.

REM ========================================
REM Complete
REM ========================================
echo.
echo ========================================
echo   SUCCESS - Servers Running!
echo ========================================
echo.
echo URLs:
echo   Client:  http://localhost:3000
echo   Backend: http://localhost:5000
echo   MongoDB: Atlas (cloud)
echo.
echo Accounts: student, instructor, centerAdmin, superAdmin
echo.
echo Docs:
echo   - DEVELOPMENT.md
echo   - docs\type-safety-guide.md
echo.
echo Stop: Press Ctrl+C or run force-kill.bat
echo.
echo ========================================
echo.
pause
