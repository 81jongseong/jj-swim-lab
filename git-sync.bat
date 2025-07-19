@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

for /f %%a in ('wmic os get localdatetime ^| find "."') do set dt=%%a
set msg=auto sync %dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%

set ROOT=%~dp0

echo ==============================
echo       GIT SYNC START
echo ==============================

for %%D in (client server) do (
  set DIR=%%D
  if exist "!DIR!\.git" (
    echo.
    echo >> Syncing !DIR!...

    pushd "!DIR!" >nul

    git pull --rebase
    git add .
    git commit -m "!msg!" >nul 2>&1

    for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%b
    git push origin !BRANCH!

    echo ? !DIR! synced
    popd >nul
  ) else (
    echo ? !DIR! - .git not found, skipped
  )
)

echo.@echo off
cd /d %~dp0

echo ==============================
echo      Git 자동 동기화 시작
echo ==============================

:: 현재 브랜치 확인
FOR /F "tokens=*" %%g IN ('git rev-parse --abbrev-ref HEAD') DO set branch=%%g
echo [INFO] 현재 브랜치: %branch%

echo.
echo [STEP] git pull --rebase 실행 중...
git pull --rebase
if errorlevel 1 (
  echo [ERROR] git pull 중 충돌 또는 오류 발생. 동기화 중단.
  pause
  exit /b 1
)

echo.
echo [STEP] git add . 실행 중...
git add .

echo.
set /p msg=[INPUT] 커밋 메시지를 입력하세요: 
git commit -m "%msg%"

echo.
echo [STEP] git push origin %branch% 실행 중...
git push origin %branch%

echo.
echo [DONE] Git 동기화 완료!
pause

echo ? 전체 Sync 완료
pause
