@echo off
echo 🚀 JJ Swim Lab - 총매출 API 테스트용 시드 데이터 생성
echo.

cd /d "%~dp0"
echo 📁 현재 디렉토리: %CD%

echo.
echo 🔧 시드 데이터 생성 중...
node scripts/seed-revenue-data.js

echo.
echo ✅ 완료! 아무 키나 누르면 종료됩니다.
pause >nul

