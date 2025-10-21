@echo off
REM ========================================
REM JJ Swim Lab - Force Kill Script
REM ========================================
REM Force kill all Node.js processes
REM Use when: Server not responding or port conflicts
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - Force Kill
color 0C

echo ========================================
echo   JJ Swim Lab - Force Kill
echo ========================================
echo.

echo Stopping all Node.js processes...
echo.

REM ========================================
REM Check Node.js processes
REM ========================================
tasklist | findstr /i "node.exe" >nul 2>&1
if not errorlevel 1 (
    echo Processes to kill:
    tasklist | findstr /i "node.exe"
    echo.
    
    echo Killing processes...
    taskkill /f /im node.exe >nul 2>&1
    
    timeout /t 2 /nobreak >nul
    
    REM Verify termination
    tasklist | findstr /i "node.exe" >nul 2>&1
    if errorlevel 1 (
        echo [OK] All Node.js processes terminated!
    ) else (
        echo [WARN] Some processes may remain
        echo        Check Task Manager to kill manually
    )
) else (
    echo [OK] No Node.js processes running
)

echo.

REM ========================================
REM Check Next.js processes
REM ========================================
echo Checking Next.js processes...
tasklist | findstr /i "next.exe" >nul 2>&1
if not errorlevel 1 (
    taskkill /f /im next.exe >nul 2>&1
    echo [OK] Next.js processes terminated
) else (
    echo [OK] No Next.js processes
)

echo.

REM ========================================
REM Port Check
REM ========================================
echo Checking ports...
echo.

echo [Port 3000 - Client]
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Still in use:
    netstat -ano | findstr ":3000" | findstr "LISTENING"
    echo.
    echo To manually kill:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        echo    taskkill /F /PID %%a
    )
) else (
    echo [OK] Port 3000 available
)

echo.

echo [Port 5000 - Server]
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Still in use:
    netstat -ano | findstr ":5000" | findstr "LISTENING"
    echo.
    echo To manually kill:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
        echo    taskkill /F /PID %%a
    )
) else (
    echo [OK] Port 5000 available
)

echo.
echo ========================================
echo   Force Kill Complete!
echo ========================================
echo.
echo To restart servers:
echo   start-server.bat
echo.
echo ========================================
echo.

pause
