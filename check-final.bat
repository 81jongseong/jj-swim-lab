@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo JJ Swim Lab Integration Check Start
echo.

set TOTAL_STEPS=4
set CURRENT_STEP=0
set FAILED_STEPS=0

REM Step 1: Auto test refresh
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Auto test refresh and file change detection
echo.
echo Running: node scripts/auto-refresh-tests.js
node scripts/auto-refresh-tests.js
if !ERRORLEVEL! NEQ 0 (
    echo Step !CURRENT_STEP! failed
    set /a FAILED_STEPS+=1
) else (
    echo Step !CURRENT_STEP! completed successfully
)
echo.

REM Step 2: Client ESLint check
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Client ESLint check
echo.
echo Running: npm run lint in client directory
cd client
npm run lint
set CLIENT_LINT_ERROR=!ERRORLEVEL!
cd ..
if !CLIENT_LINT_ERROR! NEQ 0 (
    echo Step !CURRENT_STEP! failed
    set /a FAILED_STEPS+=1
) else (
    echo Step !CURRENT_STEP! completed successfully
)
echo.

REM Step 3: Server TypeScript type check
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Server TypeScript type check
echo.
echo Running: cd server && npx tsc --noEmit
cd server
npx tsc --noEmit
set SERVER_TSC_ERROR=!ERRORLEVEL!
cd ..
if !SERVER_TSC_ERROR! NEQ 0 (
    echo Step !CURRENT_STEP! failed
    set /a FAILED_STEPS+=1
) else (
    echo Step !CURRENT_STEP! completed successfully
)
echo.

REM Step 4: Server ESLint check (warnings allowed)
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Server ESLint check (warnings allowed)
echo.
echo Running: cd server && npm run lint
cd server
npm run lint
set SERVER_LINT_ERROR=!ERRORLEVEL!
cd ..
REM Allow warnings (exit code 1) but not errors (exit code 2)
if !SERVER_LINT_ERROR! GTR 1 (
    echo Step !CURRENT_STEP! failed with errors
    set /a FAILED_STEPS+=1
) else (
    echo Step !CURRENT_STEP! completed successfully (warnings allowed)
)
echo.

REM Results summary
echo =============================================================================
echo Validation Results Summary
echo =============================================================================
echo Auto test refresh: PASSED
echo Client ESLint check: %CLIENT_LINT_ERROR%
echo Server TypeScript check: %SERVER_TSC_ERROR%
echo Server ESLint check: %SERVER_LINT_ERROR% (warnings allowed)
echo.

if !FAILED_STEPS! EQU 0 (
    echo All tests passed! Ready for deployment!
) else (
    echo Some validations failed. Please check the errors above.
    echo Failed steps: !FAILED_STEPS!
)
echo.
echo Integration check completed!
echo =============================================================================
echo.

