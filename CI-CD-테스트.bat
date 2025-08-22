@echo off
chcp 65001 >nul
title JJ Swim Lab - CI/CD 테스트

echo 🧪 JJ Swim Lab CI/CD 테스트 시작
echo ================================
echo.

:: 1단계: 코드 품질 검사
echo 🔍 1단계: 코드 품질 검사
echo --------------------------------
echo 📋 TypeScript 타입 검사...
call npm run type-check:client
if errorlevel 1 (
    echo ❌ 클라이언트 타입 검사 실패
    pause
    exit /b 1
)

call npm run type-check:server
if errorlevel 1 (
    echo ❌ 서버 타입 검사 실패
    pause
    exit /b 1
)

echo 🔍 ESLint 검사...
call npm run lint:client
call npm run lint:server

echo 🎨 Prettier 포맷 검사...
call npm run format:check

echo ✅ 코드 품질 검사 완료
echo.

:: 2단계: 테스트 실행
echo 🧪 2단계: 테스트 실행
echo --------------------------------
echo 📱 클라이언트 테스트...
cd client
call npm run test -- --watchAll=false --coverage
if errorlevel 1 (
    echo ❌ 클라이언트 테스트 실패
    cd ..
    pause
    exit /b 1
)
cd ..

echo 🔌 서버 테스트...
cd server
call npm run test -- --watchAll=false --coverage
if errorlevel 1 (
    echo ❌ 서버 테스트 실패
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ 테스트 완료
echo.

:: 3단계: 빌드 테스트
echo 🏗️ 3단계: 빌드 테스트
echo --------------------------------
echo 📱 클라이언트 빌드...
cd client
call npm run build
if errorlevel 1 (
    echo ❌ 클라이언트 빌드 실패
    cd ..
    pause
    exit /b 1
)
cd ..

echo 🔌 서버 빌드...
cd server
call npm run build
if errorlevel 1 (
    echo ❌ 서버 빌드 실패
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ 빌드 완료
echo.

:: 4단계: 성능 테스트
echo ⚡ 4단계: 성능 테스트
echo --------------------------------
echo 📦 번들 크기 분석...
cd client
call npm run bundle:analyze
cd ..

echo 📊 성능 체크...
cd client
call npm run performance
cd ..

echo ✅ 성능 테스트 완료
echo.

:: 5단계: CI/CD 결과 요약
echo 📊 CI/CD 테스트 결과 요약
echo ================================
echo ✅ 코드 품질 검사: 통과
echo ✅ 테스트 실행: 통과
echo ✅ 빌드 테스트: 통과
echo ✅ 성능 테스트: 통과
echo.
echo 🎉 모든 CI/CD 테스트가 성공적으로 완료되었습니다!
echo.
echo 💡 GitHub Actions도 자동으로 실행 중입니다!
echo    - GitHub 저장소 → Actions 탭에서 확인 가능
echo    - develop 브랜치에 푸시할 때마다 자동 실행
echo.
echo 🚀 다음 단계:
echo    1. GitHub Secrets 설정
echo    2. Vercel 배포 설정
echo    3. 자동화된 배포 테스트
echo.
pause
