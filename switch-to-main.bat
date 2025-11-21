@echo off
REM ========================================
REM JJ Swim Lab - 메인 브랜치로 전환
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - 메인 브랜치 전환
color 0C

echo ========================================
echo   JJ Swim Lab - 메인 브랜치로 전환
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 현재 변경사항 확인...
git status --short
echo.

echo [2/3] 메인 브랜치로 전환...
git checkout main
if errorlevel 1 (
    echo [ERROR] main 브랜치로 전환 실패
    echo master 브랜치를 시도합니다...
    git checkout master
    if errorlevel 1 (
        echo [ERROR] 브랜치 전환 실패
        pause
        exit /b 1
    )
)
echo [OK] 메인 브랜치로 전환 완료
echo.

echo [3/3] 최신 변경사항 가져오기...
git pull
echo.

echo ========================================
echo   메인 브랜치로 전환 완료!
echo ========================================
echo.
pause

