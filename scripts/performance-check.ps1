# JJ Swim Lab 성능 체크 스크립트
# PowerShell에서 실행하세요

Write-Host "📊 JJ Swim Lab 성능 체크를 시작합니다..." -ForegroundColor Green

# 1. 번들 크기 분석
Write-Host "📦 번들 크기를 분석합니다..." -ForegroundColor Yellow
$env:ANALYZE = "true"
npm run build:client
Remove-Item Env:ANALYZE

# 2. 타입 체크 성능
Write-Host "🔍 타입 체크 성능을 측정합니다..." -ForegroundColor Yellow
$startTime = Get-Date
npm run type-check
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "⏱️ 타입 체크 완료 시간: $($duration.TotalSeconds)초" -ForegroundColor Cyan

# 3. 린팅 성능
Write-Host "🧹 린팅 성능을 측정합니다..." -ForegroundColor Yellow
$startTime = Get-Date
npm run lint
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "⏱️ 린팅 완료 시간: $($duration.TotalSeconds)초" -ForegroundColor Cyan

# 4. 빌드 성능
Write-Host "🏗️ 빌드 성능을 측정합니다..." -ForegroundColor Yellow
$startTime = Get-Date
npm run build
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "⏱️ 전체 빌드 완료 시간: $($duration.TotalSeconds)초" -ForegroundColor Cyan

# 5. 디스크 사용량 체크
Write-Host "💾 디스크 사용량을 체크합니다..." -ForegroundColor Yellow
$nodeModulesSize = (Get-ChildItem -Path "node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$serverDistSize = (Get-ChildItem -Path "server/dist" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$clientNextSize = (Get-ChildItem -Path "client/.next" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "📁 node_modules: $([math]::Round($nodeModulesSize, 2)) MB" -ForegroundColor Cyan
Write-Host "📁 server/dist: $([math]::Round($serverDistSize, 2)) MB" -ForegroundColor Cyan
Write-Host "📁 client/.next: $([math]::Round($clientNextSize, 2)) MB" -ForegroundColor Cyan

Write-Host "🎉 성능 체크가 완료되었습니다!" -ForegroundColor Green
Write-Host "번들 분석 결과는 client/bundle-report.html에서 확인할 수 있습니다." -ForegroundColor Cyan

