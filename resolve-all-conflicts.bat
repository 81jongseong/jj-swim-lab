@echo off
REM ========================================
REM JJ Swim Lab - 모든 병합 충돌 해결 스크립트
REM ========================================
REM 원격 버전(데스크탑)을 사용하여 충돌 해결
REM ========================================

chcp 65001 >nul
title JJ Swim Lab - 병합 충돌 해결
color 0C

echo ========================================
echo   JJ Swim Lab - 모든 병합 충돌 해결
echo ========================================
echo.
echo ⚠️  주의: 모든 충돌을 원격 버전(데스크탑)으로 해결합니다.
echo    로컬 변경사항이 손실될 수 있습니다.
echo.
pause

cd /d "%~dp0"

echo [1/4] 충돌 상태 확인...
git status --short | findstr "^UU\|^AA\|^DD"
echo.

echo [2/4] 원격 버전으로 모든 충돌 해결...
echo.

REM README.md
if exist "README.md" (
    echo [INFO] README.md 충돌 해결 중...
    git checkout --theirs README.md
    git add README.md
)

REM client/app/admin/quiz/page.tsx
if exist "client\app\admin\quiz\page.tsx" (
    echo [INFO] client/app/admin/quiz/page.tsx 충돌 해결 중...
    git checkout --theirs client/app/admin/quiz/page.tsx
    git add client/app/admin/quiz/page.tsx
)

REM client/app/ai-analysis/page.tsx (삭제 충돌)
if exist "client\app\ai-analysis\page.tsx" (
    echo [INFO] client/app/ai-analysis/page.tsx 처리 중...
    REM 원격에서 삭제된 경우 로컬에서도 삭제
    git rm client/app/ai-analysis/page.tsx
) else (
    echo [INFO] client/app/ai-analysis/page.tsx 이미 삭제됨
    git rm client/app/ai-analysis/page.tsx 2>nul
)

REM client/app/community/[id]/page.tsx
if exist "client\app\community\[id]\page.tsx" (
    echo [INFO] client/app/community/[id]/page.tsx 충돌 해결 중...
    git checkout --theirs "client/app/community/[id]/page.tsx"
    git add "client/app/community/[id]/page.tsx"
)

REM client/app/community/new/page.tsx
if exist "client\app\community\new\page.tsx" (
    echo [INFO] client/app/community/new/page.tsx 충돌 해결 중...
    git checkout --theirs client/app/community/new/page.tsx
    git add client/app/community/new/page.tsx
)

REM client/app/community/page.tsx
if exist "client\app\community\page.tsx" (
    echo [INFO] client/app/community/page.tsx 충돌 해결 중...
    git checkout --theirs client/app/community/page.tsx
    git add client/app/community/page.tsx
)

REM client/app/page.tsx
if exist "client\app\page.tsx" (
    echo [INFO] client/app/page.tsx 충돌 해결 중...
    git checkout --theirs client/app/page.tsx
    git add client/app/page.tsx
)

REM client/components/Navigation.tsx
if exist "client\components\Navigation.tsx" (
    echo [INFO] client/components/Navigation.tsx 충돌 해결 중...
    git checkout --theirs client/components/Navigation.tsx
    git add client/components/Navigation.tsx
)

REM client/package.json
if exist "client\package.json" (
    echo [INFO] client/package.json 충돌 해결 중...
    git checkout --theirs client/package.json
    git add client/package.json
)

REM client/utils/api.ts
if exist "client\utils\api.ts" (
    echo [INFO] client/utils/api.ts 충돌 해결 중...
    git checkout --theirs client/utils/api.ts
    git add client/utils/api.ts
)

REM docs/프로젝트-가이드.md (삭제 충돌)
if exist "docs\프로젝트-가이드.md" (
    echo [INFO] docs/프로젝트-가이드.md 처리 중...
    git rm "docs/프로젝트-가이드.md"
) else (
    echo [INFO] docs/프로젝트-가이드.md 이미 삭제됨
    git rm "docs/프로젝트-가이드.md" 2>nul
)

REM docs/현재-작업-상황.md (삭제 충돌)
if exist "docs\현재-작업-상황.md" (
    echo [INFO] docs/현재-작업-상황.md 처리 중...
    git rm "docs/현재-작업-상황.md"
) else (
    echo [INFO] docs/현재-작업-상황.md 이미 삭제됨
    git rm "docs/현재-작업-상황.md" 2>nul
)

REM pnpm-lock.yaml
if exist "pnpm-lock.yaml" (
    echo [INFO] pnpm-lock.yaml 충돌 해결 중...
    git checkout --theirs pnpm-lock.yaml
    git add pnpm-lock.yaml
)

REM 모든 충돌 파일 해결
echo [INFO] 남은 충돌 파일 자동 해결 중...
git checkout --theirs .
git add .

echo [OK] 충돌 해결 완료
echo.

echo [3/4] 병합 커밋...
git commit -m "Merge branch 'glb-debug-viewer' - 충돌 해결 (원격 버전 사용)"
if errorlevel 1 (
    echo [WARN] 커밋 실패 (이미 해결되었을 수 있음)
)
echo.

echo [4/4] 상태 확인...
git status --short
echo.

echo ========================================
echo   충돌 해결 완료!
echo ========================================
echo.
echo 의존성 업데이트를 실행하세요:
echo   pnpm install
echo.
echo 서버 빌드를 실행하세요:
echo   cd server
echo   npm run build
echo.
pause

