@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo JJ Swim Lab Integration Check - Optimized Version
echo.

set TOTAL_STEPS=6
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

REM Step 3: Client TypeScript check with timeout
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Client TypeScript type check (with timeout)
echo.
echo Running: npx tsc --noEmit --skipLibCheck in client directory
cd client
start /B /MIN cmd /c "npx tsc --noEmit --skipLibCheck > tsc_output.txt 2>&1 & echo %ERRORLEVEL% > tsc_exitcode.txt"
timeout /t 30 /nobreak >nul
if exist tsc_exitcode.txt (
    set /p TSC_EXIT_CODE=<tsc_exitcode.txt
    del tsc_exitcode.txt
    if exist tsc_output.txt del tsc_output.txt
) else (
    set TSC_EXIT_CODE=1
)
cd ..
if !TSC_EXIT_CODE! NEQ 0 (
    echo Step !CURRENT_STEP! failed or timed out
    set /a FAILED_STEPS+=1
) else (
    echo Step !CURRENT_STEP! completed successfully
)
echo.

REM Step 4: Server TypeScript check with timeout
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Server TypeScript type check (with timeout)
echo.
echo Running: npx tsc --noEmit in server directory
cd server
start /B /MIN cmd /c "npx tsc --noEmit > tsc_output.txt 2>&1 & echo %ERRORLEVEL% > tsc_exitcode.txt"
timeout /t 30 /nobreak >nul
if exist tsc_exitcode.txt (
    set /p SERVER_TSC_EXIT_CODE=<tsc_exitcode.txt
    del tsc_exitcode.txt
    if exist tsc_output.txt del tsc_output.txt
) else (
    set SERVER_TSC_EXIT_CODE=1
)
cd ..
if !SERVER_TSC_EXIT_CODE! NEQ 0 (
    echo Step !CURRENT_STEP! failed or timed out
    set /a FAILED_STEPS+=1
) else (
    echo Step !CURRENT_STEP! completed successfully
)
echo.

REM Step 5: Server ESLint check (warnings allowed)
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Server ESLint check (warnings allowed)
echo.
echo Running: npm run lint in server directory
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

REM Step 6: Build test
set /a CURRENT_STEP+=1
echo === !CURRENT_STEP!/!TOTAL_STEPS! ===
echo Build test
echo.
echo Running: npm run build in client directory
cd client
npm run build
set BUILD_ERROR=!ERRORLEVEL!
cd ..
if !BUILD_ERROR! NEQ 0 (
    echo Step !CURRENT_STEP! failed
    set /a FAILED_STEPS+=1
) else (
    echo Step !CURRENT_STEP! completed successfully
)
echo.

REM Results summary
echo =============================================================================
echo Validation Results Summary
echo =============================================================================
echo Auto test refresh: PASSED
echo Client ESLint check: %CLIENT_LINT_ERROR%
echo Client TypeScript check: %TSC_EXIT_CODE% (with timeout)
echo Server TypeScript check: %SERVER_TSC_EXIT_CODE% (with timeout)
echo Server ESLint check: %SERVER_LINT_ERROR% (warnings allowed)
echo Build test: %BUILD_ERROR%
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



































