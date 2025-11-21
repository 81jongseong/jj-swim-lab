@echo off
REM ========================================
REM JJ Swim Lab - glb-debug-viewer 브랜치로 전환
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - glb-debug-viewer 브랜치 전환
color 0A

echo ========================================
echo   JJ Swim Lab - glb-debug-viewer 브랜치 전환
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 현재 변경사항 확인...
git status --short
echo.

echo [2/3] glb-debug-viewer 브랜치로 전환...
git checkout glb-debug-viewer
if errorlevel 1 (
    echo [WARN] 브랜치가 없습니다. 원격에서 가져옵니다...
    git fetch origin glb-debug-viewer:glb-debug-viewer
    git checkout glb-debug-viewer
    if errorlevel 1 (
        echo [ERROR] 브랜치 전환 실패
        pause
        exit /b 1
    )
)
echo [OK] glb-debug-viewer 브랜치로 전환 완료
echo.

echo [3/3] 최신 변경사항 가져오기...
git pull origin glb-debug-viewer
echo.

echo ========================================
echo   glb-debug-viewer 브랜치로 전환 완료!
echo ========================================
echo.
pause

