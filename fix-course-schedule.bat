@echo off
chcp 65001 >nul
echo.
echo ========================================
echo  강습 과정 스케줄 수정 스크립트
echo ========================================
echo.
echo 배영 중급반의 잘못된 토요일 스케줄을 삭제합니다.
echo.
pause

cd server
node scripts/fix-course-schedule.js

echo.
echo ========================================
echo  완료!
echo ========================================
pause

