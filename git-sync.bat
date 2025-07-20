@echo off
title GIT SYNC

echo ==============================
echo       GIT SYNC START
echo ==============================

echo [INFO] 현재 브랜치 확인 중...
FOR /F "tokens=*" %%g IN ('git rev-parse --abbrev-ref HEAD') DO set branch=%%g
echo [INFO] 브랜치: %branch%

echo [STEP] git pull --rebase...
git pull --rebase

echo [STEP] git add...
git add .

set /p msg=[INPUT] 커밋 메시지를 입력하세요: 
git commit -m "%msg%"

echo [STEP] git push...
git push origin %branch%

echo [DONE]  Git 동기화 완료
pause
