@echo off
chcp 65001 >nul
echo 🚀 JJ Swim Lab 시작 스크립트
echo ================================

:: 프로젝트 상태 확인
if not exist "node_modules" (
    echo 📦 node_modules가 없습니다. 의존성을 설치합니다...
    call npm install
    if errorlevel 1 (
        echo ❌ 의존성 설치 실패
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo ⚠️ .env 파일이 없습니다. .env.example을 복사합니다...
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ .env 파일이 생성되었습니다.
    ) else (
        echo ❌ .env.example 파일을 찾을 수 없습니다.
    )
)

:: CI/CD 테스트 실행 (백그라운드)
echo 🧪 CI/CD 테스트를 백그라운드에서 실행합니다...
start /B cmd /c "npm run test:ci > ci-test.log 2>&1"

:: 코드 품질 검사 (백그라운드)
echo 🔍 코드 품질 검사를 백그라운드에서 실행합니다...
start /B cmd /c "npm run lint:fix > lint.log 2>&1"

:: 서버 시작
echo 🔌 서버를 시작합니다...
start "JJ Swim Lab Server" cmd /c "cd server && npm run dev"

:: 잠시 대기
timeout /t 3 /nobreak >nul

:: 클라이언트 시작
echo 📱 클라이언트를 시작합니다...
start "JJ Swim Lab Client" cmd /c "cd client && npm run dev"

echo.
echo 🎉 JJ Swim Lab이 시작되었습니다!
echo.
echo 📊 서버: http://localhost:5000
echo 🌐 클라이언트: http://localhost:3000
echo.
echo 📋 백그라운드에서 실행 중인 작업:
echo    - CI/CD 테스트 (ci-test.log)
echo    - 코드 품질 검사 (lint.log)
echo.
echo 💡 GitHub Actions도 자동으로 실행 중입니다!
echo    - GitHub 저장소 → Actions 탭에서 확인 가능
echo.
pause
