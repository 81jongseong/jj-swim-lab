@echo off
REM ========================================
REM JJ Swim Lab - 프로젝트 업데이트 스크립트
REM ========================================
REM 노트북에서 최신 변경사항을 가져오는 스크립트
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - 프로젝트 업데이트
color 0B

echo ========================================
echo   JJ Swim Lab - 프로젝트 업데이트
echo ========================================
echo.

REM 현재 디렉토리로 설정
cd /d "%~dp0"

echo [1/4] 현재 브랜치 확인...
git branch --show-current
echo.

echo [2/4] 원격 저장소 정보 가져오기...
git fetch origin
if errorlevel 1 (
    echo [ERROR] 원격 저장소 정보 가져오기 실패
    pause
    exit /b 1
)
echo [OK] 원격 저장소 정보 가져오기 완료
echo.

echo [3/4] 현재 브랜치 업데이트...
git pull origin glb-debug-viewer
if errorlevel 1 (
    echo [ERROR] 업데이트 실패
    echo.
    echo 충돌이 발생했을 수 있습니다.
    echo 다음 명령어로 확인하세요:
    echo   git status
    echo.
    pause
    exit /b 1
)
echo [OK] 업데이트 완료
echo.

echo [4/4] 최신 커밋 확인...
git log --oneline -3
echo.

echo ========================================
echo   업데이트 완료!
echo ========================================
echo.
echo 최신 변경사항이 적용되었습니다.
echo 서버를 재시작하려면 start-server.bat를 실행하세요.
echo.
pause

