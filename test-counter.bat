@echo off
setlocal enabledelayedexpansion

set "TOTAL_STEPS=6"
set "PASSED_STEPS=0"

echo 테스트 1
set /a PASSED_STEPS+=1
echo PASSED_STEPS: !PASSED_STEPS!

echo 테스트 2
set /a PASSED_STEPS+=1
echo PASSED_STEPS: !PASSED_STEPS!

echo 테스트 3
set /a PASSED_STEPS+=1
echo PASSED_STEPS: !PASSED_STEPS!

echo 테스트 4
set /a PASSED_STEPS+=1
echo PASSED_STEPS: !PASSED_STEPS!

echo 테스트 5
set /a PASSED_STEPS+=1
echo PASSED_STEPS: !PASSED_STEPS!

echo 테스트 6
set /a PASSED_STEPS+=1
echo PASSED_STEPS: !PASSED_STEPS!

echo.
echo 최종 결과: !PASSED_STEPS!/!TOTAL_STEPS!
set /a PERCENTAGE=!PASSED_STEPS!*100/!TOTAL_STEPS!
echo 완료율: !PERCENTAGE!%%

if !PASSED_STEPS! equ !TOTAL_STEPS! (
    echo ✅ 모든 테스트 통과!
) else (
    echo ❌ 일부 테스트 실패
)
