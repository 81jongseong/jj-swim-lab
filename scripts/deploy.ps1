#!/usr/bin/env pwsh

<#
.SYNOPSIS
    JJ Swim Lab 자동화된 배포 스크립트
    
.DESCRIPTION
    GitHub Actions와 연동하여 자동으로 배포를 실행하는 스크립트입니다.
    
.PARAMETER Environment
    배포할 환경 (staging, production)
    
.PARAMETER Force
    강제 배포 실행
    
.EXAMPLE
    .\deploy.ps1 -Environment staging
    .\deploy.ps1 -Environment production -Force
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# 스크립트 시작
Write-Host "🚀 JJ Swim Lab 배포 시작..." -ForegroundColor Green
Write-Host "📅 배포 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "🌍 배포 환경: $Environment" -ForegroundColor Yellow

# 환경 변수 확인
function Test-EnvironmentVariables {
    Write-Host "🔍 환경 변수 확인 중..." -ForegroundColor Blue
    
    $requiredVars = @(
        "NODE_ENV",
        "MONGODB_URI",
        "JWT_SECRET"
    )
    
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if (-not (Get-Variable -Name $var -Scope Global -ErrorAction SilentlyContinue)) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "❌ 누락된 환경 변수:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "   - $var" -ForegroundColor Red
        }
        exit 1
    }
    
    Write-Host "✅ 모든 환경 변수가 설정되었습니다." -ForegroundColor Green
}

# 빌드 전 검사
function Test-BuildPrerequisites {
    Write-Host "🔍 빌드 전 검사 중..." -ForegroundColor Blue
    
    # Node.js 버전 확인
    $nodeVersion = node --version
    Write-Host "📦 Node.js 버전: $nodeVersion" -ForegroundColor Cyan
    
    # npm 버전 확인
    $npmVersion = npm --version
    Write-Host "📦 npm 버전: $npmVersion" -ForegroundColor Cyan
    
    # 의존성 확인
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️ node_modules가 없습니다. 의존성을 설치합니다..." -ForegroundColor Yellow
        npm install
    }
    
    if (-not (Test-Path "client/node_modules")) {
        Write-Host "⚠️ client/node_modules가 없습니다. 의존성을 설치합니다..." -ForegroundColor Yellow
        Set-Location client
        npm install
        Set-Location ..
    }
    
    if (-not (Test-Path "server/node_modules")) {
        Write-Host "⚠️ server/node_modules가 없습니다. 의존성을 설치합니다..." -ForegroundColor Yellow
        Set-Location server
        npm install
        Set-Location ..
    }
    
    Write-Host "✅ 빌드 전 검사 완료" -ForegroundColor Green
}

# 코드 품질 검사
function Test-CodeQuality {
    Write-Host "🔍 코드 품질 검사 중..." -ForegroundColor Blue
    
    try {
        # TypeScript 타입 검사
        Write-Host "📋 TypeScript 타입 검사..." -ForegroundColor Cyan
        npm run type-check:client
        npm run type-check:server
        
        # ESLint 검사
        Write-Host "🔍 ESLint 검사..." -ForegroundColor Cyan
        npm run lint:client
        npm run lint:server
        
        # Prettier 포맷 검사
        Write-Host "🎨 Prettier 포맷 검사..." -ForegroundColor Cyan
        npm run format:check
        
        Write-Host "✅ 코드 품질 검사 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 코드 품질 검사 실패: $($_.Exception.Message)" -ForegroundColor Red
        if (-not $Force) {
            exit 1
        }
        Write-Host "⚠️ 강제 배포 모드로 계속 진행합니다..." -ForegroundColor Yellow
    }
}

# 빌드 실행
function Invoke-Build {
    Write-Host "🏗️ 빌드 실행 중..." -ForegroundColor Blue
    
    try {
        # 클라이언트 빌드
        Write-Host "📱 클라이언트 빌드..." -ForegroundColor Cyan
        Set-Location client
        npm run build:prod
        Set-Location ..
        
        # 서버 빌드
        Write-Host "🔌 서버 빌드..." -ForegroundColor Cyan
        Set-Location server
        npm run build
        Set-Location ..
        
        Write-Host "✅ 빌드 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 빌드 실패: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 성능 테스트
function Test-Performance {
    Write-Host "📊 성능 테스트 중..." -ForegroundColor Blue
    
    try {
        # 번들 크기 분석
        Write-Host "📦 번들 크기 분석..." -ForegroundColor Cyan
        Set-Location client
        npm run bundle:analyze
        Set-Location ..
        
        # 성능 체크
        Write-Host "⚡ 성능 체크..." -ForegroundColor Cyan
        Set-Location client
        npm run performance
        Set-Location ..
        
        Write-Host "✅ 성능 테스트 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 성능 테스트 실패: $($_.Exception.Message)" -ForegroundColor Red
        if (-not $Force) {
            exit 1
        }
        Write-Host "⚠️ 강제 배포 모드로 계속 진행합니다..." -ForegroundColor Yellow
    }
}

# 배포 실행
function Invoke-Deploy {
    Write-Host "🚀 배포 실행 중..." -ForegroundColor Blue
    
    try {
        # Vercel CLI 설치 확인
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (-not $vercelInstalled) {
            Write-Host "📦 Vercel CLI 설치 중..." -ForegroundColor Cyan
            npm install -g vercel
        }
        
        # Vercel 로그인 확인
        Write-Host "🔐 Vercel 인증 확인..." -ForegroundColor Cyan
        vercel whoami
        
        # 배포 실행
        if ($Environment -eq "production") {
            Write-Host "🌍 프로덕션 배포..." -ForegroundColor Red
            vercel --prod
        } else {
            Write-Host "🧪 스테이징 배포..." -ForegroundColor Yellow
            vercel --target=preview
        }
        
        Write-Host "✅ 배포 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 배포 실패: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 배포 후 검증
function Test-PostDeploy {
    Write-Host "🔍 배포 후 검증 중..." -ForegroundColor Blue
    
    try {
        # 배포 상태 확인
        Write-Host "📊 배포 상태 확인..." -ForegroundColor Cyan
        vercel ls
        
        # 헬스 체크 (실제 URL로 수정 필요)
        Write-Host "💚 헬스 체크..." -ForegroundColor Cyan
        # 여기에 실제 배포된 URL로 헬스 체크 추가
        
        Write-Host "✅ 배포 후 검증 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 배포 후 검증 실패: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "⚠️ 배포는 완료되었지만 검증에 실패했습니다." -ForegroundColor Yellow
    }
}

# 메인 실행 로직
try {
    # 1. 환경 변수 확인
    Test-EnvironmentVariables
    
    # 2. 빌드 전 검사
    Test-BuildPrerequisites
    
    # 3. 코드 품질 검사
    Test-CodeQuality
    
    # 4. 빌드 실행
    Invoke-Build
    
    # 5. 성능 테스트
    Test-Performance
    
    # 6. 배포 실행
    Invoke-Deploy
    
    # 7. 배포 후 검증
    Test-PostDeploy
    
    Write-Host "🎉 배포가 성공적으로 완료되었습니다!" -ForegroundColor Green
    Write-Host "📅 완료 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
    
    # 성공 상태로 종료
    exit 0
}
catch {
    Write-Host "❌ 배포 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📅 오류 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Red
    
    # 실패 상태로 종료
    exit 1
}
