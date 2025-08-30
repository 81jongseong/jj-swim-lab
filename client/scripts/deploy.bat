@echo off
echo 🚀 JJ Swim Lab - 클라이언트 배포 스크립트
echo.

cd /d "%~dp0"
echo 📁 현재 디렉토리: %CD%

echo.
echo 🔧 환경 변수 설정...
if not exist .env.local (
  echo ⚠️ .env.local 파일이 없습니다. 기본 환경 변수를 설정합니다.
  echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
  echo NODE_ENV=production >> .env.local
  echo ✅ .env.local 파일 생성 완료
) else (
  echo ✅ .env.local 파일 확인됨
)

echo.
echo 🧹 이전 빌드 정리...
if exist .next (
  rmdir /s /q .next
  echo ✅ .next 폴더 정리 완료
)

echo.
echo 📦 의존성 설치 확인...
call npm ci --silent
if %errorlevel% neq 0 (
  echo ❌ 의존성 설치 실패
  pause
  exit /b 1
)
echo ✅ 의존성 설치 완료

echo.
echo 🔨 프로덕션 빌드 시작...
call npm run build
if %errorlevel% neq 0 (
  echo ❌ 빌드 실패
  pause
  exit /b 1
)
echo ✅ 빌드 완료

echo.
echo 🧪 빌드 결과 테스트...
call npm run start -- --port 3001 &
timeout /t 10 /nobreak >nul
taskkill /f /im node.exe >nul 2>&1
echo ✅ 빌드 테스트 완료

echo.
echo 📊 빌드 통계...
if exist .next (
  for /f "tokens=3" %%a in ('dir .next /s ^| find "File(s)"') do set size=%%a
  echo 📁 빌드 크기: %size% bytes
)

echo.
echo 🎉 배포 준비 완료!
echo 💡 다음 단계:
echo    1. 서버 환경 변수 설정
echo    2. 데이터베이스 연결 확인
echo    3. 프로덕션 서버 배포
echo    4. 도메인 및 SSL 설정
echo.
echo ✅ 모든 작업이 완료되었습니다!
pause

