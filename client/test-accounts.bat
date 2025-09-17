@echo off
echo 🔍 계정별 버튼 테스트 실행 시작...

echo.
echo 📋 1. 게스트 계정 테스트
npx playwright test e2e/account-based-button-tests.spec.ts --grep="guest" --workers=3 --timeout=10000 --reporter=line

echo.
echo 📋 2. 센터 관리자 계정 테스트  
npx playwright test e2e/account-based-button-tests.spec.ts --grep="center-admin" --workers=3 --timeout=10000 --reporter=line

echo.
echo 📋 3. 강사 계정 테스트
npx playwright test e2e/account-based-button-tests.spec.ts --grep="instructor" --workers=3 --timeout=10000 --reporter=line

echo.
echo 📋 4. 관리자 계정 테스트
npx playwright test e2e/account-based-button-tests.spec.ts --grep="admin" --workers=3 --timeout=10000 --reporter=line

echo.
echo ✅ 모든 계정별 테스트 완료!
pause
