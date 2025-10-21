@echo off
chcp 65001 > nul
cls

echo ========================================
echo  🔗 Assign Instructors to Center
echo ========================================
echo.

node server/scripts/assign-instructors-to-center.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Assignment failed!
    pause
    exit /b 1
)

echo.
pause

