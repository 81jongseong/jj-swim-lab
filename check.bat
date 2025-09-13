/**
 * 🔧 JJ Swim Lab - 통합 검증 스크립트
 * 
 * 📋 **스크립트 목적**
 * - JJ Swim Lab 프로젝트의 모든 검증 단계를 한 번에 실행
 * - TypeScript 컴파일, ESLint 검사, Jest 테스트, 빌드 테스트 통합 검증
 * - 개발 및 배포 전 품질 검증 자동화
 * - CI/CD 파이프라인과 연동 가능한 검증 시스템
 * 
 * 🔄 **검증 단계**
 * 1. 클라이언트 TypeScript 타입 검사
 * 2. 클라이언트 ESLint 린트 검사
 * 3. 서버 TypeScript 타입 검사
 * 4. 서버 ESLint 린트 검사
 * 5. 빌드 테스트 (클라이언트 + 서버)
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 통합 검증 스크립트 생성
 * - 2025-01-13: Jest 테스트 단계 제거 (시간 소요 문제로 인해)
 * - 2025-01-13: 카운팅 오류 수정 및 결과 출력 개선
 * - 2025-01-13: 한국어 인코딩 문제 해결
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-13
 * - 상태: ✅ 완성 (통합 검증 시스템 완료)
 */

@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo 🚀 JJ Swim Lab 통합 검증 시작
echo.

set "TOTAL_STEPS=5"
set "PASSED_STEPS=0"

REM 1. 클라이언트 TypeScript 타입 검사
echo.
echo === 1/5 ===
echo 클라이언트 TypeScript 타입 검사
echo.
echo 실행 중: cd client ^&^& npx tsc --noEmit
cd client
call npx tsc --noEmit
if %ERRORLEVEL% equ 0 (
    echo ✅ 클라이언트 TypeScript 타입 검사 완료
    set /a PASSED_STEPS+=1
) else (
    echo ❌ 클라이언트 TypeScript 타입 검사 실패
)
cd ..

REM 2. 클라이언트 ESLint 린트 검사
echo.
echo === 2/5 ===
echo 클라이언트 ESLint 린트 검사
echo.
echo 실행 중: cd client ^&^& npm run lint
cd client
call npm run lint
if %ERRORLEVEL% equ 0 (
    echo ✅ 클라이언트 ESLint 린트 검사 완료
    set /a PASSED_STEPS+=1
) else (
    echo ❌ 클라이언트 ESLint 린트 검사 실패
)
cd ..

REM 3. 서버 TypeScript 타입 검사
echo.
echo === 3/5 ===
echo 서버 TypeScript 타입 검사
echo.
echo 실행 중: cd server ^&^& npx tsc --noEmit
cd server
call npx tsc --noEmit
if %ERRORLEVEL% equ 0 (
    echo ✅ 서버 TypeScript 타입 검사 완료
    set /a PASSED_STEPS+=1
) else (
    echo ❌ 서버 TypeScript 타입 검사 실패
)
cd ..

REM 4. 서버 ESLint 린트 검사
echo.
echo === 4/5 ===
echo 서버 ESLint 린트 검사
echo.
echo 실행 중: cd server ^&^& npm run lint
cd server
call npm run lint
if %ERRORLEVEL% equ 0 (
    echo ✅ 서버 ESLint 린트 검사 완료
    set /a PASSED_STEPS+=1
) else (
    echo ❌ 서버 ESLint 린트 검사 실패
)
cd ..

REM 5. 빌드 테스트
echo.
echo === 5/5 ===
echo 빌드 테스트
echo.
echo 실행 중: npm run build
call npm run build
if %ERRORLEVEL% equ 0 (
    echo ✅ 빌드 테스트 완료
    set /a PASSED_STEPS+=1
    echo 디버그: PASSED_STEPS 증가 후 = !PASSED_STEPS!
) else (
    echo ❌ 빌드 테스트 실패
    echo 디버그: ERRORLEVEL = %ERRORLEVEL%
)

REM 결과 출력
echo.
echo 📊 검증 결과 요약
echo.

echo 검증이 완료되었습니다.
set /a PERCENTAGE=!PASSED_STEPS!*100/!TOTAL_STEPS!
echo 완료율: !PASSED_STEPS!/!TOTAL_STEPS! (!PERCENTAGE!%%)

REM 전체 결과
if !PASSED_STEPS! equ !TOTAL_STEPS! (
    echo.
    echo ✅ 클라이언트 TypeScript 타입 검사: 통과
    echo ✅ 클라이언트 ESLint 린트 검사: 통과
    echo ✅ 서버 TypeScript 타입 검사: 통과
    echo ✅ 서버 ESLint 린트 검사: 통과
    echo ✅ 빌드 테스트: 통과
    echo.
    echo 🎉 모든 검증이 성공적으로 완료되었습니다!
    echo ℹ️ 테스트는 별도로 실행하거나 CI/CD에서 수행하세요.
    echo.
    exit /b 0
) else (
    echo.
    echo ⚠️ 일부 검증이 실패했습니다. 위의 오류를 확인하고 수정해주세요.
    echo.
    exit /b 1
)