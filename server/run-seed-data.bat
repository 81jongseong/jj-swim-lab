@echo off
echo 🚀 샘플 데이터 생성 시작...
echo.

cd /d "%~dp0"
echo 📁 현재 디렉토리: %CD%

echo.
echo 🔧 Node.js 스크립트 실행 중...
node scripts/seed-sample-data.js

echo.
echo ✅ 샘플 데이터 생성 완료!
echo.
pause


