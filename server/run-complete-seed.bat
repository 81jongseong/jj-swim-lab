@echo off
echo 🚀 완벽한 샘플 데이터 생성 시작...
echo.
echo 📋 이 스크립트는 다음을 생성합니다:
echo    - 모든 계정 타입 (학생, 강사, 센터관리자, 총관리자)
echo    - 강의 과정 (초급, 중급, 고급)
echo    - 교수법 및 체크리스트 템플릿
echo    - 학생별 체크리스트 및 진도 관리
echo    - 예약 및 결제 데이터
echo.
cd /d "%~dp0"
echo 📁 현재 디렉토리: %CD%

echo.
echo 🔧 Node.js 스크립트 실행 중...
node scripts/seed-complete-data.js

echo.
echo ✅ 완벽한 샘플 데이터 생성 완료!
echo.
echo 🔑 테스트 계정 정보:
echo    - 강사1: instructor.kim@example.com
echo    - 강사2: instructor.lee@example.com  
echo    - 센터관리자: admin@center.com
echo    - 총관리자: superadmin@swimlab.com
echo.
pause


