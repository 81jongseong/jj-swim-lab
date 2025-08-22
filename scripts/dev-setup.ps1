# JJ Swim Lab 개발 환경 설정 스크립트
# PowerShell에서 실행하세요

Write-Host "🚀 JJ Swim Lab 개발 환경 설정을 시작합니다..." -ForegroundColor Green

# 1. 의존성 설치
Write-Host "📦 의존성을 설치합니다..." -ForegroundColor Yellow
npm run install:all

# 2. 환경 변수 파일 생성
Write-Host "🔧 환경 변수 파일을 생성합니다..." -ForegroundColor Yellow
if (!(Test-Path "server/.env")) {
    Copy-Item "server/.env.example" "server/.env" -ErrorAction SilentlyContinue
    if (Test-Path "server/.env") {
        Write-Host "✅ server/.env 파일이 생성되었습니다. 환경 변수를 설정해주세요." -ForegroundColor Green
    } else {
        Write-Host "⚠️ server/.env.example 파일이 없습니다. 수동으로 생성해주세요." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ server/.env 파일이 이미 존재합니다." -ForegroundColor Green
}

# 3. 타입 체크
Write-Host "🔍 타입 체크를 실행합니다..." -ForegroundColor Yellow
npm run type-check

# 4. 린팅
Write-Host "🧹 코드 린팅을 실행합니다..." -ForegroundColor Yellow
npm run lint

# 5. 빌드 테스트
Write-Host "🏗️ 빌드 테스트를 실행합니다..." -ForegroundColor Yellow
npm run build

Write-Host "🎉 개발 환경 설정이 완료되었습니다!" -ForegroundColor Green
Write-Host "다음 명령어로 개발 서버를 시작할 수 있습니다:" -ForegroundColor Cyan
Write-Host "  npm run dev:both" -ForegroundColor White
Write-Host "  또는" -ForegroundColor White
Write-Host "  .\start-both.bat" -ForegroundColor White

