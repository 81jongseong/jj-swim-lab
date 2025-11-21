@echo off
REM ========================================
REM JJ Swim Lab - glb-debug-viewer를 main에 병합
REM ========================================
REM 주의: 메인 브랜치에 병합하기 전에 충돌 확인 필요
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - 브랜치 병합
color 0E

echo ========================================
echo   JJ Swim Lab - 브랜치 병합
echo ========================================
echo.
echo ⚠️  주의: 이 작업은 glb-debug-viewer를 main에 병합합니다.
echo.
pause

cd /d "%~dp0"

echo [1/5] 현재 브랜치 확인...
git branch --show-current
echo.

echo [2/5] 메인 브랜치로 전환...
git checkout main
if errorlevel 1 (
    echo [ERROR] main 브랜치가 없습니다. master를 시도합니다...
    git checkout master
    if errorlevel 1 (
        echo [ERROR] 메인 브랜치 전환 실패
        pause
        exit /b 1
    )
)
echo [OK] 메인 브랜치로 전환 완료
echo.

echo [3/5] 메인 브랜치 최신화...
git pull origin main 2>nul || git pull origin master
echo.

echo [4/5] glb-debug-viewer 브랜치 병합...
git merge glb-debug-viewer --no-ff -m "Merge branch 'glb-debug-viewer' into main"
if errorlevel 1 (
    echo.
    echo [ERROR] 병합 충돌 발생!
    echo.
    echo 충돌을 해결하려면:
    echo   1. 충돌 파일 확인: git status
    echo   2. 충돌 해결 후: git add .
    echo   3. 병합 완료: git commit
    echo   4. 취소하려면: git merge --abort
    echo.
    pause
    exit /b 1
)
echo [OK] 병합 완료
echo.

echo [5/5] 원격 저장소에 푸시...
echo ⚠️  원격 저장소에 푸시하시겠습니까? (Y/N)
set /p PUSH_CONFIRM=
if /i "%PUSH_CONFIRM%"=="Y" (
    git push origin main 2>nul || git push origin master
    echo [OK] 푸시 완료
) else (
    echo [SKIP] 푸시를 건너뜁니다.
)
echo.

echo ========================================
echo   병합 완료!
echo ========================================
echo.
pause

