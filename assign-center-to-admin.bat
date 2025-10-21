@echo off
chcp 65001 >nul
echo ========================================
echo   Assign Center to Admin
echo ========================================
echo.

node server/scripts/assign-center-to-admin.js

echo.
echo ========================================
pause

