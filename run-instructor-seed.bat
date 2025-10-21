@echo off
chcp 65001 > nul
cls

echo ========================================
echo  🌱 Instructor Seed Data Generator
echo ========================================
echo.

echo [Step 1/3] Checking environment...
if not exist "server\.env" (
    echo ❌ server\.env file not found!
    echo Please create server\.env file first.
    pause
    exit /b 1
)
echo ✅ Environment OK

echo.
echo [Step 2/3] Running seed script...
node server/scripts/seed-instructors.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Seed failed!
    pause
    exit /b 1
)

echo.
echo [Step 3/3] Complete!
echo ========================================
echo  ✅ Instructor seed data created!
echo ========================================
echo.
echo 📝 You can now login with:
echo    - instructor1@jjswimlab.com
echo    - instructor2@jjswimlab.com
echo    - instructor3@jjswimlab.com
echo    Password: instructor123!
echo.

pause

