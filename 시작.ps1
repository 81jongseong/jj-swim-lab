# JJ Swim Lab - Smart Server and Client Startup (PowerShell)
# 자동으로 개발 환경을 체크하고 설정한 후 서버와 클라이언트를 시작합니다

param(
    [switch]$SkipSetup,
    [switch]$ForceSetup
)

Write-Host "🚀 JJ Swim Lab - 스마트 서버 및 클라이언트 시작" -ForegroundColor Green
Write-Host ""

# 1. 개발 환경 자동 체크 및 설정
if (-not $SkipSetup) {
    Write-Host "🔍 개발 환경을 자동으로 체크하고 설정합니다..." -ForegroundColor Yellow
    Write-Host ""

    # node_modules 존재 여부 체크
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 의존성이 설치되지 않았습니다. 자동으로 설치를 시작합니다..." -ForegroundColor Cyan
        Write-Host ""
        try {
            npm run install:all
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ 의존성 설치에 실패했습니다." -ForegroundColor Red
                Read-Host "계속하려면 아무 키나 누르세요"
                exit 1
            }
            Write-Host "✅ 의존성 설치 완료!" -ForegroundColor Green
            Write-Host ""
        } catch {
            Write-Host "❌ 의존성 설치 중 오류가 발생했습니다: $_" -ForegroundColor Red
            Read-Host "계속하려면 아무 키나 누르세요"
            exit 1
        }
    }

    # server/node_modules 체크
    if (-not (Test-Path "server\node_modules")) {
        Write-Host "📦 서버 의존성이 설치되지 않았습니다. 자동으로 설치합니다..." -ForegroundColor Cyan
        Set-Location "server"
        npm install
        Set-Location ".."
        Write-Host "✅ 서버 의존성 설치 완료!" -ForegroundColor Green
        Write-Host ""
    }

    # client/node_modules 체크
    if (-not (Test-Path "client\node_modules")) {
        Write-Host "📦 클라이언트 의존성이 설치되지 않았습니다. 자동으로 설치합니다..." -ForegroundColor Cyan
        Set-Location "client"
        npm install
        Set-Location ".."
        Write-Host "✅ 클라이언트 의존성 설치 완료!" -ForegroundColor Green
        Write-Host ""
    }

    # 환경 변수 파일 체크
    if (-not (Test-Path "server\.env")) {
        Write-Host "🔧 환경 변수 파일이 없습니다. 예시 파일을 복사합니다..." -ForegroundColor Cyan
        if (Test-Path "server\.env.example") {
            Copy-Item "server\.env.example" "server\.env" -ErrorAction SilentlyContinue
            Write-Host "✅ server/.env 파일이 생성되었습니다. 환경 변수를 설정해주세요." -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "⚠️ server/.env.example 파일이 없습니다. 수동으로 생성해주세요." -ForegroundColor Yellow
            Write-Host ""
        }
    }

    # 강제 설정 옵션
    if ($ForceSetup) {
        Write-Host "🔄 강제 설정 모드: 모든 의존성을 재설치합니다..." -ForegroundColor Yellow
        Write-Host ""
        
        # 기존 node_modules 삭제
        if (Test-Path "node_modules") {
            Remove-Item "node_modules" -Recurse -Force
            Write-Host "🗑️ 기존 node_modules 삭제 완료" -ForegroundColor Cyan
        }
        if (Test-Path "server\node_modules") {
            Remove-Item "server\node_modules" -Recurse -Force
            Write-Host "🗑️ 기존 server/node_modules 삭제 완료" -ForegroundColor Cyan
        }
        if (Test-Path "client\node_modules") {
            Remove-Item "client\node_modules" -Recurse -Force
            Write-Host "🗑️ 기존 client/node_modules 삭제 완료" -ForegroundColor Cyan
        }
        
        Write-Host ""
        Write-Host "📦 모든 의존성을 재설치합니다..." -ForegroundColor Yellow
        npm run install:all
        Write-Host "✅ 의존성 재설치 완료!" -ForegroundColor Green
        Write-Host ""
    }
}

# 2. 타입 체크 및 린팅 (백그라운드에서 실행)
Write-Host "🔍 코드 품질을 백그라운드에서 검증합니다..." -ForegroundColor Yellow
Write-Host ""

# 백그라운드 작업으로 실행
Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run type-check
} | Out-Null

Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run lint
} | Out-Null

Write-Host "✅ 백그라운드에서 코드 검증을 시작했습니다." -ForegroundColor Green
Write-Host ""

# 3. 서버 및 클라이언트 시작
Write-Host "🚀 서버와 클라이언트를 시작합니다..." -ForegroundColor Green
Write-Host ""

# 서버 시작
Write-Host "📡 서버를 시작합니다... (포트 5000)" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\server'; npm run dev" -WindowStyle Normal

# 잠시 대기
Start-Sleep -Seconds 3

# 클라이언트 시작
Write-Host "🌐 클라이언트를 시작합니다... (포트 3000)" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\client'; npm run dev" -WindowStyle Normal

# 4. 상태 확인 및 안내
Write-Host ""
Write-Host "⏳ 서버와 클라이언트가 시작되고 있습니다..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 접속 정보:" -ForegroundColor White
Write-Host "   - 클라이언트: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - 서버 API: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 상태 확인:" -ForegroundColor White
Write-Host "   - 서버 로그: 새로 열린 PowerShell 창에서 확인" -ForegroundColor Cyan
Write-Host "   - 클라이언트 로그: 새로 열린 PowerShell 창에서 확인" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 개발 팁:" -ForegroundColor White
Write-Host "   - 코드 변경 시 자동으로 새로고침됩니다" -ForegroundColor Cyan
Write-Host "   - 각 창에서 Ctrl+C로 서버를 중지할 수 있습니다" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 모든 준비가 완료되었습니다!" -ForegroundColor Green
Write-Host ""

# 백그라운드 작업 상태 확인
Write-Host "🔍 백그라운드 작업 상태:" -ForegroundColor Yellow
Get-Job | ForEach-Object {
    $status = if ($_.State -eq "Running") { "🟢 실행 중" } else { "✅ 완료" }
    Write-Host "   - $($_.Name): $status" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "계속하려면 아무 키나 누르세요"
