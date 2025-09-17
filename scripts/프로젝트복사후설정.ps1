#!/usr/bin/env pwsh

<#
.SYNOPSIS
    JJ Swim Lab 프로젝트 복사 후 자동 설정 스크립트
    
.DESCRIPTION
    새로운 환경에서 JJ Swim Lab 프로젝트를 설정하고 CI/CD 파이프라인을 활성화합니다.
    
.PARAMETER SkipSetup
    기본 설정을 건너뛰고 바로 시작
    
.PARAMETER ForceSetup
    강제로 모든 설정을 다시 실행
    
.EXAMPLE
    .\프로젝트복사후설정.ps1
    .\프로젝트복사후설정.ps1 -SkipSetup
    .\프로젝트복사후설정.ps1 -ForceSetup
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipSetup,
    
    [Parameter(Mandatory=$false)]
    [switch]$ForceSetup
)

# 스크립트 시작
Write-Host "🚀 JJ Swim Lab 프로젝트 복사 후 자동 설정 시작..." -ForegroundColor Green
Write-Host "📅 설정 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

# 1단계: 기본 환경 확인
function Test-BasicEnvironment {
    Write-Host "🔍 1단계: 기본 환경 확인 중..." -ForegroundColor Blue
    
    # Node.js 버전 확인
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js 버전: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
        Write-Host "   Node.js 18 이상을 설치해주세요: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    # npm 버전 확인
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm 버전: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ npm이 설치되지 않았습니다." -ForegroundColor Red
        exit 1
    }
    
    # Git 확인
    try {
        $gitVersion = git --version
        Write-Host "✅ Git 버전: $gitVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Git이 설치되지 않았습니다." -ForegroundColor Red
        Write-Host "   Git을 설치해주세요: https://git-scm.com/" -ForegroundColor Yellow
        exit 1
    }
}

# 2단계: 의존성 설치
function Install-Dependencies {
    Write-Host "📦 2단계: 의존성 설치 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
        # 루트 의존성 설치
        if (-not (Test-Path "node_modules") -or $ForceSetup) {
            Write-Host "📦 루트 의존성 설치..." -ForegroundColor Cyan
            npm install
        }
        
        # 클라이언트 의존성 설치
        if (-not (Test-Path "client/node_modules") -or $ForceSetup) {
            Write-Host "📦 클라이언트 의존성 설치..." -ForegroundColor Cyan
            Set-Location client
            npm install
            Set-Location ..
        }
        
        # 서버 의존성 설치
        if (-not (Test-Path "server/node_modules") -or $ForceSetup) {
            Write-Host "📦 서버 의존성 설치..." -ForegroundColor Cyan
            Set-Location server
            npm install
            Set-Location ..
        }
    }
    
    Write-Host "✅ 의존성 설치 완료" -ForegroundColor Green
}

# 3단계: 환경 변수 설정
function Setup-EnvironmentVariables {
    Write-Host "🔧 3단계: 환경 변수 설정 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
        # .env 파일 확인 및 생성
        if (-not (Test-Path ".env")) {
            if (Test-Path ".env.example") {
                Write-Host "📝 .env 파일 생성..." -ForegroundColor Cyan
                Copy-Item ".env.example" ".env"
                Write-Host "✅ .env 파일이 생성되었습니다." -ForegroundColor Green
            } else {
                Write-Host "⚠️ .env.example 파일이 없습니다. 수동으로 .env 파일을 생성해주세요." -ForegroundColor Yellow
            }
        }
        
        # MongoDB Atlas 연결 정보 확인
        Write-Host "🗄️ MongoDB Atlas 연결 정보를 확인해주세요:" -ForegroundColor Cyan
        Write-Host "   - MONGODB_URI 설정" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET 설정" -ForegroundColor Yellow
        Write-Host "   - 기타 환경 변수 설정" -ForegroundColor Yellow
    }
    
    Write-Host "✅ 환경 변수 설정 완료" -ForegroundColor Green
}

# 4단계: CI/CD 파이프라인 설정
function Setup-CICDPipeline {
    Write-Host "🔄 4단계: CI/CD 파이프라인 설정 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
        # GitHub 저장소 확인
        try {
            $remoteUrl = git remote get-url origin
            Write-Host "✅ GitHub 저장소: $remoteUrl" -ForegroundColor Green
            
            # GitHub Actions 워크플로우 확인
            if (Test-Path ".github/workflows/ci-cd.yml") {
                Write-Host "✅ CI/CD 워크플로우 파일 존재" -ForegroundColor Green
            } else {
                Write-Host "⚠️ CI/CD 워크플로우 파일이 없습니다." -ForegroundColor Yellow
            }
            
            # GitHub Secrets 설정 안내
            Write-Host "🔐 GitHub Secrets 설정이 필요합니다:" -ForegroundColor Cyan
            Write-Host "   - VERCEL_TOKEN" -ForegroundColor Yellow
            Write-Host "   - SLACK_WEBHOOK_URL" -ForegroundColor Yellow
            Write-Host "   - LHCI_GITHUB_APP_TOKEN" -ForegroundColor Yellow
            
        }
        catch {
            Write-Host "⚠️ Git 저장소가 설정되지 않았습니다." -ForegroundColor Yellow
            Write-Host "   git remote add origin <your-repo-url> 명령으로 설정해주세요." -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ CI/CD 파이프라인 설정 완료" -ForegroundColor Green
}

# 5단계: 코드 품질 검사
function Test-CodeQuality {
    Write-Host "🔍 5단계: 코드 품질 검사 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
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
            Write-Host "⚠️ 일부 검사가 실패했지만 계속 진행합니다." -ForegroundColor Yellow
        }
    }
}

# 6단계: 빌드 테스트
function Test-Build {
    Write-Host "🏗️ 6단계: 빌드 테스트 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
        try {
            # 클라이언트 빌드 테스트
            Write-Host "📱 클라이언트 빌드 테스트..." -ForegroundColor Cyan
            Set-Location client
            npm run build
            Set-Location ..
            
            # 서버 빌드 테스트
            Write-Host "🔌 서버 빌드 테스트..." -ForegroundColor Cyan
            Set-Location server
            npm run build
            Set-Location ..
            
            Write-Host "✅ 빌드 테스트 완료" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ 빌드 테스트 실패: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "⚠️ 빌드에 문제가 있지만 계속 진행합니다." -ForegroundColor Yellow
        }
    }
}

# 7단계: 성능 테스트
function Test-Performance {
    Write-Host "⚡ 7단계: 성능 테스트 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
        try {
            # 번들 크기 분석
            Write-Host "📦 번들 크기 분석..." -ForegroundColor Cyan
            Set-Location client
            npm run bundle:analyze
            Set-Location ..
            
            # 성능 체크
            Write-Host "📊 성능 체크..." -ForegroundColor Cyan
            Set-Location client
            npm run performance
            Set-Location ..
            
            Write-Host "✅ 성능 테스트 완료" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ 성능 테스트 실패: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "⚠️ 성능 테스트에 문제가 있지만 계속 진행합니다." -ForegroundColor Yellow
        }
    }
}

# 8단계: 데이터베이스 샘플 데이터 생성
function Setup-SampleData {
    Write-Host "🗄️ 8단계: 데이터베이스 샘플 데이터 생성 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
        try {
            Write-Host "📊 샘플 데이터 생성..." -ForegroundColor Cyan
            Set-Location server
            node scripts/fix-and-seed-data.js
            Set-Location ..
            Write-Host "✅ 샘플 데이터 생성 완료" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ 샘플 데이터 생성 실패: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "⚠️ 데이터베이스 연결을 확인해주세요." -ForegroundColor Yellow
        }
    }
}

# 9단계: 통합 검증 시스템 테스트
function Test-IntegratedValidation {
    Write-Host "🔍 9단계: 통합 검증 시스템 테스트 중..." -ForegroundColor Blue
    
    if (-not $SkipSetup -or $ForceSetup) {
        try {
            Write-Host "📋 통합 검증 실행..." -ForegroundColor Cyan
            if (Test-Path "check.bat") {
                & ".\check.bat"
                Write-Host "✅ 통합 검증 완료" -ForegroundColor Green
            } else {
                Write-Host "⚠️ check.bat 파일이 없습니다." -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "❌ 통합 검증 실패: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "⚠️ 통합 검증에 문제가 있지만 계속 진행합니다." -ForegroundColor Yellow
        }
    }
}

# 10단계: 서버 및 클라이언트 시작
function Start-Application {
    Write-Host "🚀 10단계: 애플리케이션 시작 중..." -ForegroundColor Blue
    
    Write-Host "🔌 서버를 시작합니다..." -ForegroundColor Cyan
    Start-Process -FilePath "cmd" -ArgumentList "/k", "cd server && npm run dev" -WindowStyle Normal
    
    Start-Sleep -Seconds 3
    
    Write-Host "📱 클라이언트를 시작합니다..." -ForegroundColor Cyan
    Start-Process -FilePath "cmd" -ArgumentList "/k", "cd client && npm run dev" -WindowStyle Normal
    
    Write-Host "✅ 애플리케이션이 시작되었습니다!" -ForegroundColor Green
}

# 메인 실행 로직
try {
    # 1. 기본 환경 확인
    Test-BasicEnvironment
    
    # 2. 의존성 설치
    Install-Dependencies
    
    # 3. 환경 변수 설정
    Setup-EnvironmentVariables
    
    # 4. CI/CD 파이프라인 설정
    Setup-CICDPipeline
    
    # 5. 코드 품질 검사
    Test-CodeQuality
    
    # 6. 빌드 테스트
    Test-Build
    
    # 7. 성능 테스트
    Test-Performance
    
    # 8. 데이터베이스 샘플 데이터 생성
    Setup-SampleData
    
    # 9. 통합 검증 시스템 테스트
    Test-IntegratedValidation
    
    # 10. 애플리케이션 시작
    Start-Application
    
    Write-Host "🎉 JJ Swim Lab 프로젝트 설정이 완료되었습니다!" -ForegroundColor Green
    Write-Host "📅 완료 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
    
    Write-Host "🌐 접속 정보:" -ForegroundColor Yellow
    Write-Host "   - 클라이언트: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   - 서버: http://localhost:5000" -ForegroundColor Cyan
    
    Write-Host "📋 다음 단계:" -ForegroundColor Yellow
    Write-Host "   1. MongoDB Atlas 연결 확인" -ForegroundColor Cyan
    Write-Host "   2. 로그인 테스트 (admin/101010, center/101010, teacher/101010, student1/101010)" -ForegroundColor Cyan
    Write-Host "   3. 기능 테스트" -ForegroundColor Cyan
    Write-Host "   4. 통합 검증 시스템 사용 (check.bat)" -ForegroundColor Cyan
    Write-Host "   5. GitHub Secrets 설정" -ForegroundColor Cyan
    Write-Host "   6. CI/CD 파이프라인 테스트" -ForegroundColor Cyan
    
    # 성공 상태로 종료
    exit 0
}
catch {
    Write-Host "❌ 설정 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📅 오류 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Red
    
    # 실패 상태로 종료
    exit 1
}
