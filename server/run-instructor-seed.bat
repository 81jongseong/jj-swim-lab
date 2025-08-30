@echo off
chcp 65001 >nul
echo.
echo 🌱 JJ Swim Lab - 강사관리 시스템 시드 데이터 생성
echo ===================================================
echo.

echo 📍 현재 디렉토리: %CD%
echo.

echo 🔍 환경 변수 파일 확인 중...
if not exist ".env" (
    echo ❌ .env 파일을 찾을 수 없습니다.
    echo 📝 .env.example 파일을 복사하여 .env 파일을 생성해주세요.
    pause
    exit /b 1
)

echo ✅ .env 파일 확인 완료
echo.

echo 🚀 MongoDB 연결 확인 중...
echo.

echo 📊 시드 데이터 생성을 시작합니다...
echo.

node scripts/seed-instructor-management.js

echo.
echo 🎉 시드 데이터 생성 완료!
echo.
echo 📋 생성된 데이터:
echo    - 센터: 3개
echo    - 강사: 6명
echo    - 학생: 8명
echo    - 강습 과정: 4개
echo    - 강습 예약: 50개
echo    - 체크리스트: 30개
echo    - 건강 데이터: 8개
echo.

pause

