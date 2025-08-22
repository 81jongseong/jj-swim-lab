@echo off
chcp 65001 >nul
title JJ Swim Lab - Smart Server and Client Startup

echo.
echo 🚀 JJ Swim Lab - 스마트 서버 및 클라이언트 시작
echo.

:: 1. 개발 환경 자동 체크 및 설정
echo 🔍 개발 환경을 자동으로 체크하고 설정합니다...
echo.

:: node_modules 존재 여부 체크
if not exist "node_modules" (
    echo 📦 의존성이 설치되지 않았습니다. 자동으로 설치를 시작합니다...
    echo.
    npm run install:all
    if errorlevel 1 (
        echo ❌ 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
    echo ✅ 의존성 설치 완료!
    echo.
)

:: server/node_modules 체크
if not exist "server\node_modules" (
    echo 📦 서버 의존성이 설치되지 않았습니다. 자동으로 설치합니다...
    cd server
    npm install
    cd ..
    echo ✅ 서버 의존성 설치 완료!
    echo.
)

:: client/node_modules 체크
if not exist "client\node_modules" (
    echo 📦 클라이언트 의존성이 설치되지 않았습니다. 자동으로 설치합니다...
    cd client
    npm install
    cd ..
    echo ✅ 클라이언트 의존성 설치 완료!
    echo.
)

:: 환경 변수 파일 체크
if not exist "server\.env" (
    echo 🔧 환경 변수 파일이 없습니다. 예시 파일을 복사합니다...
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo ✅ server/.env 파일이 생성되었습니다. 환경 변수를 설정해주세요.
        echo.
    ) else (
        echo ⚠️ server/.env.example 파일이 없습니다. 수동으로 생성해주세요.
        echo.
    )
)

:: 2. 타입 체크 및 린팅 (빠른 검증)
echo 🔍 코드 품질을 빠르게 검증합니다...
echo.

:: 타입 체크 (백그라운드에서 실행)
start /b cmd /c "npm run type-check >nul 2>&1"

:: 린팅 (백그라운드에서 실행)
start /b cmd /c "npm run lint >nul 2>&1"

echo ✅ 백그라운드에서 코드 검증을 시작했습니다.
echo.

:: 3. 서버 및 클라이언트 시작
echo 🚀 서버와 클라이언트를 시작합니다...
echo.

:: 서버 시작 (백그라운드)
echo 📡 서버를 시작합니다... (포트 5000)
start "JJ Swim Lab Server" cmd /c "cd server && npm run dev"

:: 잠시 대기
timeout /t 3 /nobreak >nul

:: 클라이언트 시작 (백그라운드)
echo 🌐 클라이언트를 시작합니다... (포트 3000)
start "JJ Swim Lab Client" cmd /c "cd client && npm run dev"

:: 4. 상태 확인 및 안내
echo.
echo ⏳ 서버와 클라이언트가 시작되고 있습니다...
echo.
echo 📍 접속 정보:
echo    - 클라이언트: http://localhost:3000
echo    - 서버 API: http://localhost:5000
echo.
echo 🔍 상태 확인:
echo    - 서버 로그: "JJ Swim Lab Server" 창에서 확인
echo    - 클라이언트 로그: "JJ Swim Lab Client" 창에서 확인
echo.
echo 💡 개발 팁:
echo    - 코드 변경 시 자동으로 새로고침됩니다
echo    - 서버 오류는 "JJ Swim Lab Server" 창에서 확인하세요
echo    - 클라이언트 오류는 "JJ Swim Lab Client" 창에서 확인하세요
echo.
echo 🎯 모든 준비가 완료되었습니다!
echo.
pause
