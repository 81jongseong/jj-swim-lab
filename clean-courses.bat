@echo off
chcp 65001 >nul
echo ========================================
echo   Clean Empty Schedule Courses
echo ========================================
echo.

node server/scripts/clean-empty-schedules.js

echo.
echo ========================================
pause

