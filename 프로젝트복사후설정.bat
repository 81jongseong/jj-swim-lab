@echo off
chcp 65001 >nul
title JJ Swim Lab - 프로젝트 복사 후 자동 설정

echo 🚀 JJ Swim Lab 프로젝트 복사 후 자동 설정 시작
echo ================================================
echo 📅 설정 시간: %date% %time%
echo.

:: 프로젝트 루트 디렉토리로 이동 (사용자명 독립적)
cd /d "%~dp0"
echo 📁 작업 디렉토리: %CD%
echo.

:: 1단계: 기본 환경 확인
echo 🔍 1단계: 기본 환경 확인 중...
echo --------------------------------
echo 📦 Node.js 버전 확인...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    Node.js 18 이상을 설치해주세요: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js 버전: %%i
)

echo 📦 npm 버전 확인...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm이 설치되지 않았습니다.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm 버전: %%i
)

echo 📦 Git 버전 확인...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git이 설치되지 않았습니다.
    echo    Git을 설치해주세요: https://git-scm.com/
    pause
    exit /b 1
) else (
    for /f "tokens*" %%i in ('git --version') do echo ✅ Git 버전: %%i
)

echo ✅ 기본 환경 확인 완료
echo.

:: 2단계: pnpm 설치 및 확인
echo 📦 2단계: pnpm 설치 및 확인...
echo --------------------------------
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 pnpm이 설치되지 않았습니다. 설치 중...
    call npm install -g pnpm
    if errorlevel 1 (
        echo ❌ pnpm 설치 실패
        echo    npm install -g pnpm 명령을 수동으로 실행해주세요.
        pause
        exit /b 1
    )
    echo ✅ pnpm 설치 완료
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do echo ✅ pnpm 버전: %%i
)
echo.

:: 3단계: 의존성 설치 (버전 호환성 자동 관리)
echo 📦 3단계: 의존성 설치 중...
echo --------------------------------
echo 📦 루트 의존성 설치... (버전 호환성 자동 관리)
if not exist "node_modules" (
    call pnpm install --frozen-lockfile
    if errorlevel 1 (
        echo ⚠️ 기본 설치 실패, 호환성 모드로 재시도...
        call pnpm install --legacy-peer-deps
        if errorlevel 1 (
            echo ❌ 루트 의존성 설치 실패
            pause
            exit /b 1
        )
    )
    echo ✅ 루트 의존성 설치 완료
) else (
    echo ✅ 루트 의존성 이미 설치됨
)

echo 📦 클라이언트 의존성 설치... (버전 호환성 자동 관리)
if not exist "client\node_modules" (
    cd client
    call pnpm install --frozen-lockfile
    if errorlevel 1 (
        echo ⚠️ 기본 설치 실패, 호환성 모드로 재시도...
        call pnpm install --legacy-peer-deps
        if errorlevel 1 (
            echo ❌ 클라이언트 의존성 설치 실패
            cd ..
            pause
            exit /b 1
        )
    )
    cd ..
    echo ✅ 클라이언트 의존성 설치 완료
) else (
    echo ✅ 클라이언트 의존성 이미 설치됨
)

echo 📦 서버 의존성 설치... (버전 호환성 자동 관리)
if not exist "server\node_modules" (
    cd server
    call pnpm install --frozen-lockfile
    if errorlevel 1 (
        echo ⚠️ 기본 설치 실패, 호환성 모드로 재시도...
        call pnpm install --legacy-peer-deps
        if errorlevel 1 (
            echo ❌ 서버 의존성 설치 실패
            cd ..
            pause
            exit /b 1
        )
    )
    cd ..
    echo ✅ 서버 의존성 설치 완료
) else (
    echo ✅ 서버 의존성 이미 설치됨
)

echo ✅ 의존성 설치 완료
echo.

:: 4단계: 환경 변수 설정
echo 🔧 4단계: 환경 변수 설정 중...
echo --------------------------------
if not exist ".env" (
    if exist ".env.example" (
        echo 📝 .env 파일 생성...
        copy ".env.example" ".env" >nul
        echo ✅ .env 파일이 생성되었습니다.
        echo ⚠️ MongoDB 연결 정보를 수정해주세요!
    ) else (
        echo ⚠️ .env.example 파일이 없습니다. 수동으로 .env 파일을 생성해주세요.
    )
) else (
    echo ✅ .env 파일 이미 존재
)

echo 🗄️ MongoDB Atlas 연결 정보를 확인해주세요:
echo    - MONGODB_URI 설정
echo    - JWT_SECRET 설정
echo    - 기타 환경 변수 설정
echo ✅ 환경 변수 설정 완료
echo.

:: 5단계: Git 저장소 설정
echo 🔄 5단계: Git 저장소 설정 중...
echo --------------------------------
echo 📂 GitHub 저장소 확인...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Git 저장소가 설정되지 않았습니다.
    echo    git remote add origin ^<your-repo-url^> 명령으로 설정해주세요.
) else (
    for /f "tokens=*" %%i in ('git remote get-url origin') do echo ✅ GitHub 저장소: %%i
)

if exist ".github\workflows\ci-cd.yml" (
    echo ✅ CI/CD 워크플로우 파일 존재
) else (
    echo ⚠️ CI/CD 워크플로우 파일이 없습니다.
)

echo ✅ Git 저장소 설정 완료
echo.

:: 6단계: 코드 품질 검사
echo 🔍 6단계: 코드 품질 검사 중...
echo --------------------------------
echo 📋 TypeScript 타입 검사...
cd client
call pnpm run type-check >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 클라이언트 타입 검사에 문제가 있습니다.
) else (
    echo ✅ 클라이언트 타입 검사 통과
)
cd ..

cd server
call pnpm run type-check >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 서버 타입 검사에 문제가 있습니다.
) else (
    echo ✅ 서버 타입 검사 통과
)
cd ..

echo 🔍 ESLint 검사...
cd client
call pnpm run lint >nul 2>&1
cd ..

cd server
call pnpm run lint >nul 2>&1
cd ..

echo ✅ 코드 품질 검사 완료
echo.

:: 7단계: 빌드 테스트
echo 🏗️ 7단계: 빌드 테스트 중...
echo --------------------------------
echo 📱 클라이언트 빌드 테스트...
cd client
call pnpm run build >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 클라이언트 빌드에 문제가 있습니다.
) else (
    echo ✅ 클라이언트 빌드 성공
)
cd ..

echo 🔌 서버 빌드 테스트...
cd server
call pnpm run build >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 서버 빌드에 문제가 있습니다.
) else (
    echo ✅ 서버 빌드 성공
)
cd ..

echo ✅ 빌드 테스트 완료
echo.

:: 8단계: 데이터베이스 샘플 데이터 생성
echo 🗄️ 8단계: 데이터베이스 샘플 데이터 생성 중...
echo --------------------------------
echo 📊 샘플 데이터 생성...
cd server
call node scripts/fix-and-seed-data.js
cd ..
echo ✅ 샘플 데이터 생성 완료

:: 9단계: 통합 검증 시스템 테스트
echo 🔍 9단계: 통합 검증 시스템 테스트 중...
echo --------------------------------
echo 📋 통합 검증 실행...
call check.bat
echo ✅ 통합 검증 완료

:: 10단계: 서버 및 클라이언트 시작
echo 🚀 10단계: 애플리케이션 시작 중...
echo --------------------------------
echo 🔌 서버를 시작합니다...
start "JJ Swim Lab Server" cmd /k "cd /d "%~dp0server" && pnpm run dev"

timeout /t 3 /nobreak >nul

echo 📱 클라이언트를 시작합니다...
start "JJ Swim Lab Client" cmd /k "cd /d "%~dp0client" && pnpm run dev"

echo ✅ 애플리케이션이 시작되었습니다!
echo.

:: 완료 메시지
echo 🎉 JJ Swim Lab 프로젝트 설정이 완료되었습니다!
echo 📅 완료 시간: %date% %time%
echo.
echo 🌐 접속 정보:
echo    - 클라이언트: http://localhost:3000
echo    - 서버: http://localhost:5000
echo.
echo 📋 다음 단계:
echo    1. MongoDB Atlas 연결 확인
echo    2. 로그인 테스트 (admin/101010, center/101010, teacher/101010, student1/101010)
echo    3. 기능 테스트
echo    4. 통합 검증 시스템 사용 (check.bat)
echo.
echo 💡 개발 완료 후 각 터미널에서 Ctrl+C로 서버를 중지할 수 있습니다.
echo.
pause
