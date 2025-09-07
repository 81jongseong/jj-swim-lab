@echo off
chcp 65001 >nul
echo 강제 종료 실행 중...
echo.

echo Node.js 프로세스 종료...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js 프로세스 종료 완료
) else (
    echo ℹ️ 실행 중인 Node.js 프로세스가 없습니다
)

echo.
echo Next.js 프로세스 종료...
taskkill /f /im next.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Next.js 프로세스 종료 완료
) else (
    echo ℹ️ 실행 중인 Next.js 프로세스가 없습니다
)

echo.
echo 포트 확인...
netstat -ano | findstr :3000
netstat -ano | findstr :5000

echo.
echo 강제 종료 완료!
echo 아무 키나 누르면 창이 닫힙니다.
pause >nul

