@echo off
cd /d C:\사용자\user\jj-swim-lab

echo ?? git pull...
git pull --rebase

echo ?? git add...
git add .

set /p msg=?? 커밋 메시지를 입력하세요: 
git commit -m "%msg%"

echo ?? git push...
FOR /F "tokens=*" %%g IN ('git rev-parse --abbrev-ref HEAD') DO set branch=%%g
git push origin %branch%

echo ? Sync 완료
pause
