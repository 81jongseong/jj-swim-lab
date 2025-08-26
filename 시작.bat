@echo off
chcp 65001 >nul
title JJ Swim Lab - 개발 서버 시작

echo 🚀 JJ Swim Lab 개발 서버 시작
echo ================================
echo 📅 시작 시간: %date% %time%
echo.

:: 프로젝트 루트 디렉토리로 이동 (사용자명 독립적)
cd /d "%~dp0"
echo 📁 작업 디렉토리: %CD%
echo.

:: 서버 시작
echo 🔌 MongoDB 서버를 시작합니다...
start "JJ Swim Lab Server" cmd /k "cd /d "%~dp0server" && pnpm run dev"

:: 서버 시작 대기
echo ⏳ 서버 시작 대기 중... (3초)
timeout /t 3 /nobreak >nul

:: 클라이언트 시작
echo 📱 Next.js 클라이언트를 시작합니다...
start "JJ Swim Lab Client" cmd /k "cd /d "%~dp0client" && pnpm run dev"

:: 완료 메시지
echo.
echo 🎉 JJ Swim Lab 개발 서버가 시작되었습니다!
echo 📅 완료 시간: %date% %time%
echo.
echo 🌐 접속 정보:
echo    - 클라이언트: http://localhost:3000
echo    - 서버: http://localhost:5000
echo.
echo 📋 실행 중인 프로세스:
echo    - MongoDB 서버 (포트 5000)
echo    - Next.js 클라이언트 (포트 3000)
echo.
echo 💡 개발 완료 후 각 터미널에서 Ctrl+C로 서버를 중지할 수 있습니다.
echo.
pause
