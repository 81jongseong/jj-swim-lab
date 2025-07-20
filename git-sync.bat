@echo off
setlocal enabledelayedexpansion

cd /d %~dp0

echo ==============================
echo      GIT SYNC START
echo ==============================

:: 현재 브랜치 확인
FOR /F "delims=" %%b IN ('git rev-parse --abbrev-ref HEAD 2^>nul') DO (
    set BRANCH=%%b
)
if not defined BRANCH (
    echo [ERROR] 현재 브랜치를 확인할 수 없습니다.
    pause
    exit /b
)
echo [INFO] 현재 브랜치: %BRANCH%

:: 변경사항 확인
git diff --quiet
IF ERRORLEVEL 1 (
    echo [INFO] 변경사항 있음 → 자동 커밋 준비

    git add .

    set /p COMMIT_MSG=[INPUT] 커밋 메시지를 입력하세요: 
    REM 공백 제거 후 실제 문자열 있는지 확인
    set "COMMIT_MSG_CLEAN=!COMMIT_MSG: =!"

    if "!COMMIT_MSG_CLEAN!"=="" (
        set COMMIT_MSG= 자동 커밋
        echo [INFO] 커밋 메시지 없음 → 기본 메시지로 대체: !COMMIT_MSG!
    ) else (
        echo [INFO] 입력된 메시지: !COMMIT_MSG!
    )

    echo [STEP] git commit...
    git commit -m "!COMMIT_MSG!"
    IF ERRORLEVEL 1 (
        echo [ERROR] 커밋 실패. pull 중단됨.
        pause
        exit /b
    )
) ELSE (
    echo [INFO] 변경사항 없음
)

:: pull --rebase
echo [STEP] git pull --rebase...
git pull --rebase origin %BRANCH%
IF ERRORLEVEL 1 (
    echo [ERROR] git pull --rebase 중 충돌 또는 실패
    pause
    exit /b
)

:: push
echo [STEP] git push...
git push origin %BRANCH%
IF ERRORLEVEL 1 (
    echo [ERROR] git push 중 오류 발생
    pause
    exit /b
)

echo [DONE] Git 동기화 완료
pause
exit /b
