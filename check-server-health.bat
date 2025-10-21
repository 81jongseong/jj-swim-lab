@echo off
REM ========================================
REM JJ Swim Lab - Server Health Check
REM ========================================
REM Check server and client running status
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - Health Check
color 0B

echo ========================================
echo   JJ Swim Lab - Server Health Check
echo ========================================
echo.

REM ========================================
REM Step 1: Process Check
REM ========================================
echo [1/3] Checking processes...
echo.

tasklist | findstr /i "node.exe" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Node.js processes running:
    tasklist | findstr /i "node.exe"
) else (
    echo [ERROR] No Node.js processes
)

echo.

REM ========================================
REM Step 2: Port Check
REM ========================================
echo [2/3] Checking ports...
echo.

REM Check port 5000 (server)
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Port 5000 (Server) in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
        echo      PID: %%a
    )
) else (
    echo [ERROR] Port 5000 (Server) not in use
)

echo.

REM Check port 3000 (client)
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Port 3000 (Client) in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        echo      PID: %%a
    )
) else (
    echo [ERROR] Port 3000 (Client) not in use
)

echo.

REM ========================================
REM Step 3: API Health Check
REM ========================================
echo [3/3] Checking API health...
echo.

REM Check server API
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '[OK] Server API responding (200 OK)' -ForegroundColor Green } else { Write-Host '[WARN] Server response: ' $response.StatusCode -ForegroundColor Yellow } } catch { Write-Host '[ERROR] Server API not responding' -ForegroundColor Red }" 2>nul

REM Check client
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '[OK] Client responding (200 OK)' -ForegroundColor Green } else { Write-Host '[WARN] Client response: ' $response.StatusCode -ForegroundColor Yellow } } catch { Write-Host '[ERROR] Client not responding' -ForegroundColor Red }" 2>nul

echo.

REM ========================================
REM Summary
REM ========================================
echo ========================================
echo   Status Summary
echo ========================================
echo.
echo If servers are running:
echo   - Browser: http://localhost:3000
echo   - API Test: http://localhost:5000/api/health
echo.
echo If servers are not running:
echo   - Run: start-server.bat
echo.
echo If problems occur:
echo   - Check: DEVELOPMENT.md
echo   - Force stop: force-kill.bat
echo   - Restart: start-server.bat
echo.
echo ========================================

pause
