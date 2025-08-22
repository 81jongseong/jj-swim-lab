@echo off
chcp 65001 >nul
title JJ Swim Lab - 간단한 시작

echo.
echo 🚀 JJ Swim Lab - 간단한 시작
echo.

:: 기본적인 의존성만 체크
if not exist "node_modules" (
    echo 📦 기본 의존성을 설치합니다...
    npm install
    echo.
)

:: 서버와 클라이언트 시작
echo 🚀 서버와 클라이언트를 시작합니다...
echo.

start "Server" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
start "Client" cmd /k "cd client && npm run dev"

echo ✅ 서버와 클라이언트가 시작되었습니다!
echo 📍 클라이언트: http://localhost:3000
echo 📍 서버: http://localhost:5000
echo.
pause

