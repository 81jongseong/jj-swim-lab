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

echo [3/4] 현재 브랜치 확인 및 업데이트...
set CURRENT_BRANCH=
for /f "delims=" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 현재 브랜치: %CURRENT_BRANCH%
echo.

REM glb-debug-viewer 브랜치가 아니면 전환
if not "%CURRENT_BRANCH%"=="glb-debug-viewer" (
    echo [INFO] glb-debug-viewer 브랜치로 전환 중...
    git checkout glb-debug-viewer
    if errorlevel 1 (
        echo [WARN] 브랜치 전환 실패, 원격에서 가져오기 시도...
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
)

REM 원격 저장소와 로컬 브랜치 동기화
echo [3-1/4] 원격 저장소와 동기화...
git pull origin glb-debug-viewer --no-rebase
if errorlevel 1 (
    echo [ERROR] 업데이트 실패 - 충돌 발생
    echo.
    echo 충돌을 자동으로 해결하시겠습니까? (Y/N)
    set /p CONFLICT_RESOLVE=
    if /i "%CONFLICT_RESOLVE%"=="Y" (
        echo.
        echo [INFO] 충돌 해결 스크립트 실행 중...
        if exist "resolve-all-conflicts.bat" (
            call resolve-all-conflicts.bat
        ) else (
            echo [WARN] resolve-all-conflicts.bat 파일이 없습니다.
            echo [INFO] 수동으로 해결하세요:
            echo   git checkout --theirs .
            echo   git add .
            echo   git commit -m "Merge conflict resolved"
        )
    ) else (
        echo.
        echo 충돌을 수동으로 해결하세요:
        echo   git status
        echo   또는 resolve-all-conflicts.bat 실행
        echo.
        pause
        exit /b 1
    )
)
echo [OK] 업데이트 완료
echo.

echo [4/4] 최신 커밋 확인...
echo.
echo ========================================
echo 최신 커밋 (로컬):
git log --oneline -1
echo.
echo 최신 커밋 (원격):
git log --oneline origin/glb-debug-viewer -1
echo.
echo 현재 HEAD 커밋:
git rev-parse --short HEAD
echo ========================================
echo.

echo ========================================
echo   업데이트 완료!
echo ========================================
echo.
echo 최신 변경사항이 적용되었습니다.
echo 서버를 재시작하려면 start-server.bat를 실행하세요.
echo.
pause

