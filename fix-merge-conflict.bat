@echo off
REM ========================================
REM JJ Swim Lab - 병합 충돌 해결 스크립트
REM ========================================
REM dist 폴더 충돌 해결 (빌드 결과물이므로 원격 버전 사용)
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - 병합 충돌 해결
color 0E

echo ========================================
echo   JJ Swim Lab - 병합 충돌 해결
echo ========================================
echo.
echo ⚠️  주의: server/dist 폴더의 로컬 변경사항을 버립니다.
echo    (빌드 결과물이므로 다시 빌드하면 됩니다)
echo.
pause

cd /d "%~dp0"

echo [1/3] server/dist 폴더의 로컬 변경사항 버리기...
git checkout -- server/dist/
if errorlevel 1 (
    echo [WARN] 일부 파일 복원 실패 (정상일 수 있음)
)
echo [OK] server/dist 폴더 복원 완료
echo.

echo [2/3] 최신 변경사항 가져오기...
git pull origin glb-debug-viewer
if errorlevel 1 (
    echo [ERROR] 업데이트 실패
    echo.
    echo 다른 충돌이 있을 수 있습니다.
    echo 다음 명령어로 확인하세요:
    echo   git status
    echo.
    pause
    exit /b 1
)
echo [OK] 업데이트 완료
echo.

echo [3/3] 서버 빌드 실행 (dist 폴더 재생성)...
cd server
call npm run build
if errorlevel 1 (
    echo [WARN] 빌드 실패 (수동으로 실행하세요: cd server && npm run build)
) else (
    echo [OK] 빌드 완료
)
cd ..
echo.

echo ========================================
echo   충돌 해결 완료!
echo ========================================
echo.
echo 최신 변경사항이 적용되었습니다.
echo 서버를 재시작하려면 start-server.bat를 실행하세요.
echo.
pause

