# 계정별 버튼 테스트 실행 스크립트
Write-Host "🔍 계정별 버튼 테스트 실행 시작..." -ForegroundColor Green

Write-Host ""
Write-Host "📋 1. 게스트 계정 테스트" -ForegroundColor Yellow
npx playwright test e2e/account-based-button-tests.spec.ts --grep="3d-viewer|accessibility|community|news|quiz|map|membership|notifications|payments|uploads|video-upload|ai-evaluation|localization|personalized-dashboard|user-role-integration" --workers=3 --timeout=10000 --reporter=line

Write-Host ""
Write-Host "📋 2. 센터 관리자 계정 테스트" -ForegroundColor Yellow
npx playwright test e2e/account-based-button-tests.spec.ts --grep="center-admin" --workers=3 --timeout=10000 --reporter=line

Write-Host ""
Write-Host "📋 3. 강사 계정 테스트" -ForegroundColor Yellow
npx playwright test e2e/account-based-button-tests.spec.ts --grep="instructor" --workers=3 --timeout=10000 --reporter=line

Write-Host ""
Write-Host "📋 4. 관리자 계정 테스트" -ForegroundColor Yellow
npx playwright test e2e/account-based-button-tests.spec.ts --grep="admin" --workers=3 --timeout=10000 --reporter=line

Write-Host ""
Write-Host "✅ 모든 계정별 테스트 완료!" -ForegroundColor Green
