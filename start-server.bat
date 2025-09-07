@echo off
chcp 65001 >nul
title JJ Swim Lab - Server Start

echo Starting JJ Swim Lab Server...
echo.

cd /d "%~dp0"

echo Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting MongoDB Server...
start "JJ Swim Lab Server" cmd /k "cd /d "%~dp0server" && pnpm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Starting Next.js Client...
start "JJ Swim Lab Client" cmd /k "cd /d "%~dp0client" && pnpm run dev"

echo.
echo JJ Swim Lab development servers started!
echo.
echo Access URLs:
echo   - Client: http://localhost:3000
echo   - Server: http://localhost:5000
echo.
echo Press Ctrl+C in each terminal window to stop the servers.
echo.
pause

