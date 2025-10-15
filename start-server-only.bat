@echo off
echo ========================================
echo 🚀 JJ Swim Lab 서버 시작
echo ========================================
echo.

REM 기존 서버 프로세스 종료
echo 🔍 기존 서버 프로세스 확인 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo 🛑 포트 5000을 사용 중인 프로세스 %%a 종료 중...
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ 포트 정리 완료!
echo.

REM 서버 디렉토리로 이동
cd server

echo 🚀 서버 시작 중...
echo.
npm run dev

